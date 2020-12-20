import { ASTPath, ASTNode } from 'jscodeshift'
import t from 'ast-types'
import BooleanLiteral from './BooleanLiteral'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import RegExpLiteral from './RegExpLiteral'
import StringLiteral from './StringLiteral'
import __debug from 'debug'

export type CompileOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
  debugIndent?: string
}

export type MatchOptions = {
  onCapture: (identifier: string, path: ASTPath<any>) => void
}

export type CompiledMatcher = (
  path: ASTPath<any>,
  options: MatchOptions
) => boolean

const _debug = __debug('astx:match')

const nodeMatchers: Record<
  string,
  (query: any, options: CompileOptions) => CompiledMatcher
> = {
  BooleanLiteral,
  Literal,
  NumericLiteral,
  RegExpLiteral,
  StringLiteral,
}

function isCompatibleType(path: ASTPath<any>, query: ASTNode): boolean {
  if (t.namedTypes.Function.check(query)) {
    return t.namedTypes.Function.check(path.node)
  }
  return false
}

export default function compileMatcher(
  query: ASTNode | ASTNode[],
  compileOptions: CompileOptions = {}
): CompiledMatcher {
  const { debugIndent = '' } = compileOptions
  const debug = (format: string, ...args: any[]) =>
    _debug.enabled ? _debug(debugIndent + format, ...args) : null
  if (Array.isArray(query)) {
    const elemMatchers: CompiledMatcher[] = query.map((queryElem) =>
      compileMatcher(queryElem, {
        ...compileOptions,
        debugIndent: debugIndent + '    ',
      })
    )
    return (path: ASTPath, options: MatchOptions): boolean => {
      debug('Array')
      if (!Array.isArray(path.value)) {
        debug('  path.value is not an array')
        return false
      }
      if (path.value.length !== query.length) {
        debug(
          '  path.value.length (%d) !== query.length (%d)',
          path.value.length,
          query.length
        )
        return false
      }
      for (let i = 0; i < elemMatchers.length; i++) {
        debug('  [%d]', i)
        if (!elemMatchers[i](path.get(i), options)) return false
      }
      return true
    }
  } else if (query.type === 'Identifier') {
    return (path: ASTPath, options: MatchOptions): boolean => {
      debug('identifier', query.name)
      const captureMatch = /^\$[a-z0-9]+/i.exec(query.name)
      if (captureMatch) {
        const whereCondition = compileOptions?.where?.[captureMatch[0]]
        if (whereCondition && !whereCondition(path)) {
          debug('  where condition returned false')
          return false
        }
        options.onCapture(captureMatch[0], path)
        debug('  captured as %s', captureMatch[0])
        return true
      } else {
        if (
          path.node?.type === 'Identifier' &&
          path.node.name === query.name.replace(/^\$\$/g, '$')
        ) {
          debug('  matched')
          return true
        } else {
          debug(`  didn't match`)
          return false
        }
      }
    }
  } else if (nodeMatchers[query.type]) {
    const compiled: CompiledMatcher = nodeMatchers[query.type](query, {
      ...compileOptions,
      debugIndent: debugIndent + '    ',
    })
    return (path: ASTPath<any>, options: MatchOptions) => {
      debug('%s (specific)', query.type)
      if (compiled(path, options)) {
        debug('  matched')
        return true
      } else {
        debug(`  didn't match`)
        return false
      }
    }
  } else {
    const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
      t
        .getFieldNames(query)
        .filter((key) => key !== 'type')
        .map((key: string): [string, CompiledMatcher] => {
          const value = (query as any)[key]
          if (typeof value !== 'object' || value == null) {
            return [
              key,
              (path: ASTPath<any>): boolean => {
                if (value !== path.node[key]) {
                  debug('    %s !== %s', value, path.node[key])
                  return false
                } else {
                  debug('    %s === %s', value, path.node[key])
                  return true
                }
              },
            ]
          } else {
            return [
              key,
              compileMatcher(value, {
                ...compileOptions,
                debugIndent: debugIndent + '    ',
              }),
            ]
          }
        })
    )

    return (path: ASTPath<any>, options: MatchOptions): boolean => {
      debug('%s (generic)', query.type)
      if (path.node?.type === query.type || isCompatibleType(path, query)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          if (!matcher(path.get(key), options)) return false
        }
        return true
      } else {
        debug(
          '  path.node?.type (%s) is not compatible with query.type (%s)',
          path.node?.type,
          query.type
        )
        return false
      }
    }
  }
}
