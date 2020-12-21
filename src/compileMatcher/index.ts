import { ASTPath, ASTNode } from 'jscodeshift'
import BooleanLiteral from './BooleanLiteral'
import Identifier from './Identifier'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import ObjectExpression from './ObjectExpression'
import RegExpLiteral from './RegExpLiteral'
import StringLiteral from './StringLiteral'
import __debug, { Debugger } from 'debug'
import indentDebug from './indentDebug'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileGenericArrayMatcher from './GenericArrayMatcher'

const _debug = __debug('astx:match')

export type RootCompileOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
  debug?: Debugger
}

export type CompileOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
  debug: Debugger
}

export type Captures = Record<string, ASTPath<any>>
export type ArrayCaptures = Record<string, ASTPath<any>[]>

export type MatchResult = {
  captures?: Captures
  arrayCaptures?: ArrayCaptures
} | null

export function mergeCaptures(
  current: MatchResult,
  ...results: MatchResult[]
): MatchResult {
  for (const result of results) {
    if (!result) continue
    if (result.captures) {
      if (!current) current = {}
      if (!current.captures) current.captures = {}
      Object.assign(current.captures, result.captures)
    }
    if (result.arrayCaptures) {
      if (!current) current = {}
      if (!current.arrayCaptures) current.arrayCaptures = {}
      Object.assign(current.arrayCaptures, result.arrayCaptures)
    }
  }
  return current
}

export type NonCapturingMatcher = (path: ASTPath<any>) => boolean

export type CompiledMatcher = (path: ASTPath<any>) => MatchResult

const nodeMatchers: Record<
  string,
  (query: any, options: CompileOptions) => CompiledMatcher | NonCapturingMatcher
> = {
  BooleanLiteral,
  Identifier,
  Literal,
  NumericLiteral,
  ObjectExpression,
  RegExpLiteral,
  StringLiteral,
}

export default function compileMatcher(
  query: ASTNode | ASTNode[],
  compileOptions: RootCompileOptions = {}
): CompiledMatcher {
  const { debug = _debug } = compileOptions
  if (Array.isArray(query)) {
    return compileGenericArrayMatcher(query, { ...compileOptions, debug })
  } else if (nodeMatchers[query.type]) {
    const compiled: CompiledMatcher | NonCapturingMatcher = nodeMatchers[
      query.type
    ](query, {
      ...compileOptions,
      debug: indentDebug(debug, 1),
    })
    return (path: ASTPath<any>): MatchResult => {
      debug('%s (specific)', query.type)
      const result = compiled(path)
      if (result) {
        if (result === true) debug('  matched')
        return typeof result === 'object' ? result : {}
      } else {
        if (result === false) debug(`  didn't match`)
        return null
      }
    }
  } else {
    return compileGenericNodeMatcher(query, { ...compileOptions, debug })
  }
}
