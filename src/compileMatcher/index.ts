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

type Captures = Record<string, ASTPath<any>>

export type MatchResult = { captures?: Captures } | null

export type NonCapturingMatcher = (path: ASTPath<any>) => boolean

export type CompiledMatcher = (path: ASTPath<any>) => MatchResult

const _debug = __debug('astx:match')

const nodeMatchers: Record<
  string,
  (query: any, options: CompileOptions) => CompiledMatcher | NonCapturingMatcher
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
    return (path: ASTPath): MatchResult => {
      let captures: Captures | undefined

      debug('Array')
      if (!Array.isArray(path.value)) {
        debug('  path.value is not an array')
        return null
      }
      if (path.value.length !== query.length) {
        debug(
          '  path.value.length (%d) !== query.length (%d)',
          path.value.length,
          query.length
        )
        return null
      }
      for (let i = 0; i < elemMatchers.length; i++) {
        debug('  [%d]', i)
        const result = elemMatchers[i](path.get(i))
        if (!result) return null
        if (result.captures) {
          if (!captures) captures = {}
          Object.assign(captures, result.captures)
        }
      }
      return { captures }
    }
  } else if (query.type === 'Identifier') {
    return (path: ASTPath): MatchResult => {
      debug('identifier', query.name)
      const captureMatch = /^\$[a-z0-9]+/i.exec(query.name)
      if (captureMatch) {
        const whereCondition = compileOptions?.where?.[captureMatch[0]]
        if (whereCondition && !whereCondition(path)) {
          debug('  where condition returned false')
          return null
        }
        debug('  captured as %s', captureMatch[0])
        return { captures: { [captureMatch[0]]: path } }
      } else {
        if (
          path.node?.type === 'Identifier' &&
          path.node.name === query.name.replace(/^\$\$/g, '$')
        ) {
          debug('  matched')
          return {}
        } else {
          debug(`  didn't match`)
          return null
        }
      }
    }
  } else if (nodeMatchers[query.type]) {
    const compiled: CompiledMatcher | NonCapturingMatcher = nodeMatchers[
      query.type
    ](query, {
      ...compileOptions,
      debugIndent: debugIndent + '    ',
    })
    return (path: ASTPath<any>): MatchResult => {
      debug('%s (specific)', query.type)
      const result = compiled(path)
      if (result) {
        debug('  matched')
        return typeof result === 'object' ? result : {}
      } else {
        debug(`  didn't match`)
        return null
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
              (path: ASTPath<any>): MatchResult => {
                if (value !== path.node[key]) {
                  debug('    %s !== %s', value, path.node[key])
                  return null
                } else {
                  debug('    %s === %s', value, path.node[key])
                  return {}
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

    return (path: ASTPath<any>): MatchResult => {
      let captures: Captures | undefined

      debug('%s (generic)', query.type)
      if (path.node?.type === query.type || isCompatibleType(path, query)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          const result = matcher(path.get(key))
          if (!result) return null
          if (result.captures) {
            if (!captures) captures = {}
            Object.assign(captures, result.captures)
          }
        }
        return { captures }
      } else {
        debug(
          '  path.node?.type (%s) is not compatible with query.type (%s)',
          path.node?.type,
          query.type
        )
        return null
      }
    }
  }
}
