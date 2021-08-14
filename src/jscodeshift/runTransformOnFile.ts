import jscodeshift, {
  ASTNode,
  Expression,
  Parser,
  Statement,
  JSCodeshift,
} from 'jscodeshift'
import { getParserAsync } from 'babel-parse-wild-code'
import Astx, { GetReplacement } from './Astx'
import fs from 'fs-extra'
import Path from 'path'
import memoize from 'lodash/memoize'
import { promisify } from 'util'
import _resolve from 'resolve'
import makeTemplate from './util/template'
import { FindOptions, Match } from './find'
import omitBlankLineChanges from '../util/omitBlankLineChanges'
import generate from '@babel/generator'
import prepareForBabelGenerate from '../util/prepareForBabelGenerate'
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
  j: JSCodeshift
  jscodeshift: JSCodeshift
  report: (msg: string) => void
}

export type Transform = {
  astx?: (options: TransformOptions) => string | null | undefined | void
  parser?: string | Parser
  find?: string | ASTNode
  replace?: string | GetReplacement
  where?: FindOptions['where']
}

export type TransformResult = {
  file: string
  source?: string
  transformed?: string
  reports?: any[]
  error?: Error
  matches?: Match[]
}

const getPrettier = memoize(
  async (path: string): Promise<any> => {
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
  }
)

const getBabelGenerator = memoize(
  async (path: string): Promise<any> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const babelGenerator = require(await resolve('@babel/generator', {
        basedir: path,
      }))
      if (typeof babelGenerator.default === 'function')
        return babelGenerator.default
    } catch (error) {
      // ignore
    }
    return generate
  }
)

export const runTransformOnFile = (
  transform: Transform,
  { useBabelGenerator = true }: { useBabelGenerator?: boolean } = {}
) => async (file: string): Promise<TransformResult> => {
  try {
    const source = await fs.readFile(file, 'utf8')
    const parser =
      transform.parser || (await getParserAsync(file, { tokens: true }))
    const j = jscodeshift.withParser(parser)
    const template = makeTemplate(j)

    let transformed
    const reports: any[] = []

    let matches: Match[] | undefined

    let transformFn = transform.astx

    if (typeof transformFn !== 'function' && transform.find) {
      transformFn = ({ astx }): any => {
        const result = astx.find(
          transform.find as string | ASTNode | ASTNode[],
          {
            where: transform.where,
          }
        )
        if (transform.replace) result.replace(transform.replace as any)
        matches = result.matches()
        if (!result.size()) return null
      }
    }
    if (typeof transformFn === 'function') {
      const root = j(source)
      const options = {
        source,
        path: file,
        j,
        jscodeshift: j,
        report: (msg: any) => {
          reports.push(msg)
        },
        ...template,
        astx: new Astx(j, root.paths()),
      }
      const [_result, prettier, babelGenerator] = await Promise.all([
        transformFn(options),
        getPrettier(Path.dirname(file)),
        useBabelGenerator ? getBabelGenerator(Path.dirname(file)) : null,
      ])
      transformed = _result
      if (transformed === undefined) {
        if (useBabelGenerator) {
          if (babelGenerator) {
            const ast = root.get().node
            prepareForBabelGenerate(ast)
            transformed = babelGenerator(ast, { concise: true }).code
          } else {
            throw new Error(
              `unable to resolve @babel/generator in this directory`
            )
          }
        } else transformed = root.toSource()
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
    } else {
      return {
        file,
        error: new Error(
          'transform file must export either astx or find/replace'
        ),
      }
    }
    return {
      file,
      source,
      transformed,
      reports,
      matches,
    }
  } catch (error) {
    return {
      file,
      error,
    }
  }
}
