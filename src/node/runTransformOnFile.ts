import fs from 'fs-extra'
import Path from 'path'
import { memoize } from 'lodash'
import { promisify } from 'util'
import _resolve from 'resolve'
import { Match } from '../find'
import omitBlankLineChanges from '../util/omitBlankLineChanges'
import CodeFrameError from '../util/CodeFrameError'
import { AstxConfig } from '../AstxConfig'
import chooseGetBackend from '../chooseGetBackend'
import { astxCosmiconfig } from './astxCosmiconfig'
import Astx, { Transform, TransformOptions, TransformResult } from '../Astx'
import { Node } from '../types'
import './registerTsNode'
const resolve = promisify(_resolve) as any

const getPrettier = memoize(async (path: string): Promise<any> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let prettier = await import(
      /* webpackIgnore: true */
      await resolve('prettier', {
        basedir: path,
      })
    )
    if (prettier.default instanceof Object) {
      prettier = prettier.default
    }
    if (
      typeof prettier.format === 'function' &&
      typeof prettier.resolveConfig === 'function'
    ) {
      return prettier
    }
  } catch (error) {
    // ignore
  }
  return null
})

export type RunTransformOnFileOptions = {
  file: string
  transform?: Transform
  transformFile?: string
  config?: Partial<AstxConfig>
  signal?: AbortSignal
  forWorker?: boolean
}

export default async function runTransformOnFile({
  transform: _transform,
  transformFile,
  config: configOverrides,
  file,
  signal,
  forWorker,
}: RunTransformOnFileOptions): Promise<TransformResult> {
  const transform: Transform = transformFile
    ? await import(transformFile)
    : _transform

  const config = (await astxCosmiconfig.search(Path.dirname(file)))?.config as
    | AstxConfig
    | undefined

  if (signal?.aborted) throw new Error('aborted')

  const parser = configOverrides?.parser ?? config?.parser
  const parserOptions = {
    ...config?.parserOptions,
    ...configOverrides?.parserOptions,
  }

  const backend = await chooseGetBackend(parser)(file, parserOptions)
  if (signal?.aborted) throw new Error('aborted')

  try {
    const source = await fs.readFile(file, 'utf8')
    if (signal?.aborted) throw new Error('aborted')

    let transformed
    const reports: unknown[] = []

    let matches: readonly Match[] | undefined

    let transformFn = transform.astx

    const { find, replace } = transform
    if (typeof transformFn !== 'function' && find) {
      transformFn = ({ astx }: TransformOptions): any => {
        const result = astx.find(find as string | Node | Node[], {
          where: transform.where,
        })
        if (replace) result.replace(replace)
        matches = result.matches
        if (!result.size) return null
      }
    }
    if (typeof transformFn === 'function') {
      let ast, root
      try {
        ast = backend.parse(source)
        root = new backend.t.NodePath(ast)
      } catch (error) {
        if (error instanceof Error) {
          CodeFrameError.rethrow(error, { filename: file, source })
        }
        throw error
      }
      const options = {
        source,
        file,
        root,
        t: backend.t,
        report: (msg: unknown) => {
          if (msg instanceof Astx && !msg.size) return
          if (!forWorker) transform.onReport?.({ file, report: msg })
          reports.push(msg)
        },
        ...backend.template,
        astx: new Astx(backend, [root]),
      }
      const [_result, prettier] = await Promise.all([
        transformFn(options),
        config.prettier !== false ? getPrettier(Path.dirname(file)) : null,
      ])
      if (signal?.aborted) throw new Error('aborted')
      if (transform.astx || transform.replace) {
        transformed = _result
        if (transformed === undefined) {
          transformed = backend.generate(ast).code
        }
        if (transformed === null) transformed = undefined
        if (
          prettier &&
          typeof transformed === 'string' &&
          transformed !== source
        ) {
          const config = (await prettier.resolveConfig(file)) || {}
          config.filepath = file
          if (/\.tsx?$/.test(file)) config.parser = 'typescript'
          transformed = prettier.format(transformed, config)
        }
        if (transformed != null) {
          transformed = omitBlankLineChanges(source, transformed)
        }
      }
    } else {
      return {
        file,
        error: new Error(
          'transform file must export either astx or find/replace'
        ),
        backend,
      }
    }
    return {
      file,
      source,
      transformed,
      reports,
      matches,
      backend,
    }
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error : new Error(String(error)),
      backend,
    }
  }
}
