import { ASTPath, ASTNode } from 'jscodeshift'
import t from 'ast-types'
import BooleanLiteral from './BooleanLiteral'
import Identifier from './Identifier'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
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

export type MatchResult = { captures?: Captures } | null

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
      debug: indentDebug(debug, 2),
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
