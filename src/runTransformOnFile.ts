import * as AstTypes from 'ast-types'
import { Expression, Node, Statement } from './types'
import Astx, { GetReplacement } from './Astx'
import fs from 'fs-extra'
import Path from 'path'
import memoize from 'lodash/memoize'
import { promisify } from 'util'
import _resolve from 'resolve'
import { FindOptions, Match } from './find'
import omitBlankLineChanges from './util/omitBlankLineChanges'
import CodeFrameError from './util/CodeFrameError'
import { Backend, GetBackend } from './backend/Backend'
import chooseGetBackend from './chooseGetBackend'
const resolve = promisify(_resolve) as any

type TransformOptions = {
  /** The absolute path to the current file. */
  path: string
  /** The source code of the current file. */
  source: string
  astx: Astx
  expression(strings: TemplateStringsArray, ...quasis: any[]): Expression
  statement(strings: TemplateStringsArray, ...quasis: any[]): Statement
  statements(strings: TemplateStringsArray, ...quasis: any[]): Statement[]
  t: typeof AstTypes
  report: (msg: string) => void
}

export type Transform = {
  astx?: (options: TransformOptions) => string | null | undefined | void
  parser?: string | Backend
  find?: string | Node | Node[]
  replace?: string | Node | Node[] | GetReplacement
  where?: FindOptions['where']
}

export type TransformResult = {
  file: string
  source?: string
  transformed?: string
  reports?: any[]
  error?: Error
  matches?: readonly Match[]
  backend: Backend
}

const getPrettier = memoize(async (path: string): Promise<any> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prettier = require(await resolve('prettier', {
      basedir: path,
    }))
    if (
      typeof prettier.format === 'function' &&
      typeof prettier.resolveConfig === 'function'
    )
      return prettier
  } catch (error) {
    // ignore
  }
  return null
})

const runTransformOnFile =
  ({
    transform,
    getBackend,
  }: {
    transform: Transform
    getBackend: GetBackend
  }) =>
  async (file: string): Promise<TransformResult> => {
    const { parser } = transform
    let backend: Backend
    try {
      backend =
        typeof parser === 'string'
          ? await chooseGetBackend(parser)(file)
          : parser instanceof Object
          ? parser
          : await getBackend(file)
    } catch (error) {
      return {
        file,
        error: error instanceof Error ? error : new Error(String(error)),
        backend: null as any,
      }
    }

    try {
      const source = await fs.readFile(file, 'utf8')

      let transformed
      const reports: any[] = []

      let matches: readonly Match[] | undefined

      let transformFn = transform.astx

      const { find, replace } = transform
      if (typeof transformFn !== 'function' && find) {
        transformFn = ({ astx }): any => {
          const result = astx.find(find, {
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
          path: file,
          root,
          t: backend.t,
          report: (msg: any) => {
            reports.push(msg)
          },
          ...backend.template,
          astx: new Astx(backend, [root]),
        }
        const [_result, prettier] = await Promise.all([
          transformFn(options),
          getPrettier(Path.dirname(file)),
        ])
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
            if (/\.tsx?$/.test(file)) config.parser = 'typescript'
            transformed = prettier.format(transformed, config)
          }
          if (transformed != null)
            transformed = omitBlankLineChanges(source, transformed)
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

export default runTransformOnFile
