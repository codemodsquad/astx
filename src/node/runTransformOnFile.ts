import defaultFs from 'fs-extra'
import Path from 'path'
import { memoize } from 'lodash'
import { promisify } from 'util'
import _resolve from 'resolve'
import { Match } from '../find'
import omitBlankLineChanges from '../util/omitBlankLineChanges'
import CodeFrameError from '../util/CodeFrameError'
import { AstxConfig, debugConfig } from '../AstxConfig'
import chooseGetBackend from '../chooseGetBackend'
import { astxCosmiconfig } from './astxCosmiconfig'
import Astx, { Transform, TransformOptions, TransformResult } from '../Astx'
import { Node } from '../types'
import { SimpleReplacementCollector } from '../util/SimpleReplacementCollector'
import { importTransformFile } from './importTransformFile'

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
  return await import('prettier')
})

export interface Fs {
  readFile(file: string, encoding: string): Promise<string>
}

export type RunTransformOnFileOptions = {
  file: string
  source?: string
  transform?: Transform
  transformFile?: string
  getResolveAgainstDir?: () => string
  config?: Partial<AstxConfig>
  signal?: AbortSignal
  forWorker?: boolean
  fs?: Fs
}

export default async function runTransformOnFile({
  transform: _transform,
  transformFile,
  getResolveAgainstDir = () =>
    transformFile ? Path.dirname(transformFile) : process.cwd(),
  config: configOverrides,
  file,
  source,
  signal,
  forWorker,
  fs = defaultFs,
}: RunTransformOnFileOptions): Promise<TransformResult> {
  // might try using callsites for this in the future in case a transform
  // script is broken up into multiple files

  const transform: Transform = transformFile
    ? await importTransformFile(transformFile)
    : _transform ??
      ((): Transform => {
        throw new Error('transformFile or transform is required')
      })()

  const baseConfig = (await astxCosmiconfig.search(Path.dirname(file)))
    ?.config as AstxConfig | undefined

  const config: AstxConfig = {
    ...baseConfig,
    ...configOverrides,
    parserOptions:
      baseConfig?.parserOptions || configOverrides?.parserOptions
        ? {
            ...baseConfig?.parserOptions,
            ...configOverrides?.parserOptions,
          }
        : undefined,
  }

  debugConfig('runTransformOnFile', 'baseConfig', baseConfig)
  debugConfig('runTransformOnFile', 'configOverrides', configOverrides)
  debugConfig('runTransformOnFile', 'config', config)

  if (signal?.aborted) throw new Error('aborted')

  const { parser, parserOptions, preferSimpleReplacement } = config

  const backend = await chooseGetBackend(parser)(file, parserOptions)
  if (signal?.aborted) throw new Error('aborted')

  try {
    if (!source) source = await fs.readFile(file, 'utf8')
    if (signal?.aborted) throw new Error('aborted')

    let transformed
    const reports: unknown[] = []

    const matches: Match[] = []

    const mark = (...args: (Match | Match[] | Astx | Astx[])[]) => {
      for (const arg of args) {
        for (const elem of Array.isArray(arg) ? arg : [arg]) {
          if (elem instanceof Astx) {
            for (const match of elem.matches) matches.push(match)
          } else {
            matches.push(elem)
          }
        }
      }
    }

    let transformFn = transform.astx

    const { find, replace } = transform
    if (typeof transformFn !== 'function' && find) {
      transformFn = ({ astx, mark }: TransformOptions): any => {
        const result = astx.find(find as string | Node | Node[], {
          where: transform.where,
        })
        if (replace) result.replace(replace)
        mark(result)
        if (!result.size) return null
      }
    }
    const createFiles: NonNullable<TransformResult['create']> = []
    if (typeof transformFn === 'function') {
      let ast, root
      try {
        ast = backend.parse(source)
        root = new backend.t.NodePath(ast)
      } catch (error) {
        if (error instanceof Error) {
          CodeFrameError.rethrow(error, {
            filename: file,
            source,
          })
        }
        throw error
      }
      const simpleReplacements = preferSimpleReplacement
        ? new SimpleReplacementCollector({
            source,
            backend,
          })
        : undefined
      const options: TransformOptions = {
        source,
        file,
        t: backend.t,
        report: (msg: unknown) => {
          if (msg instanceof Astx && !msg.size) return
          if (!forWorker)
            transform.onReport?.({
              file,
              report: msg,
            })
          reports.push(msg)
        },
        ...backend.template,
        astx: new Astx(
          {
            backend,
            simpleReplacements,
            filename: file,
            getResolveAgainstDir,
          },
          [root]
        ),
        createFile: (
          otherFile: string,
          content: string | Node | (string | Node)[]
        ) => {
          createFiles.push({
            file: Path.resolve(getResolveAgainstDir(), otherFile),
            transformed:
              typeof content === 'string'
                ? content
                : Array.isArray(content)
                ? content
                    .map((node) =>
                      typeof node === 'string'
                        ? node
                        : backend.generate(node).code
                    )
                    .join('\n')
                : backend.generate(content).code,
          })
        },
        mark,
      }
      const [_result, prettier] = await Promise.all([
        transformFn(options),
        config?.prettier !== false ? getPrettier(Path.dirname(file)) : null,
      ])
      if (signal?.aborted) throw new Error('aborted')
      if (transform.astx || transform.replace) {
        transformed = _result
        if (transformed === undefined) {
          if (simpleReplacements) {
            try {
              transformed = simpleReplacements.applyReplacements()
            } catch (error) {
              // ignore
            }
          }
          if (transformed === undefined) {
            transformed = backend.generate(ast).code
          }
        }
        if (transformed === null) transformed = undefined
        if (
          prettier &&
          (createFiles.length ||
            (typeof transformed === 'string' && transformed !== source))
        ) {
          const prettierConfig = (await prettier.resolveConfig(file)) || {}
          prettierConfig.filepath = file
          if (/\.tsx?$/.test(file)) prettierConfig.parser = 'typescript'
          if (typeof transformed === 'string' && transformed !== source) {
            transformed = await prettier.format(transformed, prettierConfig)
          }
          for (const create of createFiles) {
            create.transformed = await prettier.format(
              create.transformed,
              prettierConfig
            )
          }
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
      matches: matches.length ? matches : undefined,
      backend,
      ...(createFiles.length && { create: createFiles }),
    }
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error : new Error(String(error)),
      backend,
    }
  }
}
