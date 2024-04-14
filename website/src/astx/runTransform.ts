import Astx, { Transform, TransformOptions, TransformResult } from 'astx/Astx'
import { Match } from 'astx/find'
import { Backend } from 'astx/backend/Backend'
import { SimpleReplacementCollector } from 'astx/util/SimpleReplacementCollector'
import omitBlankLineChanges from 'astx/util/omitBlankLineChanges'
import { babelBackend } from './babelBackend'
import CodeFrameError from 'astx/util/CodeFrameError'

export default async function runTransform({
  source,
  transformSource,
  file = 'input.tsx',
  backend = babelBackend,
}: {
  source: string
  transformSource: string
  file?: string
  backend?: Backend
}): Promise<TransformResult> {
  try {
    const transform: Transform = {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exports = transform
    eval(transformSource)
    const transformFn = transform.astx

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
      const preferSimpleReplacement = true
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
          },
          [root]
        ),
        mark,
      }
      const _result = await transformFn(options)
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
        // if (
        //   prettier &&
        //   typeof transformed === 'string' &&
        //   transformed !== source
        // ) {
        //   const prettierConfig = {}
        // const prettierConfig = {
        // parser: 'babel'
        // }
        // prettierConfig.filepath = file
        // if (/\.tsx?$/.test(file)) prettierConfig.parser = 'typescript'
        //   transformed = await prettier.format(transformed, prettierConfig)
        // }
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
    }
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error : new Error(String(error)),
      backend,
    }
  }
}
