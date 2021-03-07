import { ASTPath, ASTNode } from 'jscodeshift'
import t from 'ast-types'
import __debug, { Debugger } from 'debug'
import ArrayExpression from './ArrayExpression'
import BlockStatement from './BlockStatement'
import BooleanLiteral from './BooleanLiteral'
import ClassBody from './ClassBody'
import ClassDeclaration from './ClassDeclaration'
import compileFunctionMatcher from './Function'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import indentDebug from './indentDebug'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import ObjectExpression from './ObjectExpression'
import RegExpLiteral from './RegExpLiteral'
import SequenceExpression from './SequenceExpression'
import StringLiteral from './StringLiteral'
import TSTupleType from './TSTupleType'
import TSTypeParameterDeclaration from './TSTypeParameterDeclaration'
import TSTypeParameterInstantiation from './TSTypeParameterInstantiation'
import TSTypeReference from './TSTypeReference'
import TupleTypeAnnotation from './TupleTypeAnnotation'
import TypeParameterDeclaration from './TypeParameterDeclaration'
import TypeParameterInstantiation from './TypeParameterInstantiation'

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

export function mergeCaptures(...results: MatchResult[]): MatchResult {
  let current: MatchResult = null
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

export type NonCapturingMatcher = {
  match: (path: ASTPath<any>, matchSoFar: MatchResult) => boolean
  nodeType?: keyof typeof t.namedTypes | (keyof typeof t.namedTypes)[]
}

export interface CompiledMatcher {
  match: (path: ASTPath<any>, matchSoFar: MatchResult) => MatchResult
  nodeType?: keyof typeof t.namedTypes | (keyof typeof t.namedTypes)[]
}

const nodeMatchers: Record<
  string,
  (query: any, options: CompileOptions) => CompiledMatcher | NonCapturingMatcher
> = {
  ArrayExpression,
  BlockStatement,
  BooleanLiteral,
  ClassBody,
  ClassDeclaration,
  ClassExpression: ClassDeclaration,
  GenericTypeAnnotation,
  Identifier,
  Literal,
  NumericLiteral,
  ObjectExpression,
  RegExpLiteral,
  SequenceExpression,
  StringLiteral,
  TSTupleType,
  TSTypeParameterDeclaration,
  TSTypeParameterInstantiation,
  TSTypeReference,
  TupleTypeAnnotation,
  TypeParameterDeclaration,
  TypeParameterInstantiation,
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
    return {
      match: (path: ASTPath<any>, matchSoFar: MatchResult): MatchResult => {
        debug('%s (specific)', query.type)
        const result = compiled.match(path, matchSoFar)
        if (result) {
          if (result === true) debug('  matched')
          return typeof result === 'object' ? result : matchSoFar || {}
        } else {
          if (result === false) debug(`  didn't match`)
          return null
        }
      },
      nodeType: compiled.nodeType,
    }
  } else if (t.namedTypes.Function.check(query)) {
    return compileFunctionMatcher(query, { ...compileOptions, debug })
  } else {
    return compileGenericNodeMatcher(query, { ...compileOptions, debug })
  }
}
