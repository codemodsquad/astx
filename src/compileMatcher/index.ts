import { ASTPath, ASTNode } from 'jscodeshift'
import t from 'ast-types'
import __debug, { Debugger } from 'debug'
import BooleanLiteral from './BooleanLiteral'
import ClassDeclaration from './ClassDeclaration'
import ClassImplements from './ClassImplements'
import ClassProperty from './ClassProperty'
import compileFunctionMatcher from './Function'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import ExpressionStatement from './ExpressionStatement'
import FunctionTypeParam from './FunctionTypeParam'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import ObjectExpression from './ObjectExpression'
import ObjectProperty from './ObjectProperty'
import ObjectTypeProperty from './ObjectTypeProperty'
import RegExpLiteral from './RegExpLiteral'
import StringLiteral from './StringLiteral'
import TSExpressionWithTypeArguments from './TSExpressionWithTypeArguments'
import TSPropertySignature from './TSPropertySignature'
import TSTypeParameter from './TSTypeParameter'
import TSTypeReference from './TSTypeReference'
import TypeParameter from './TypeParameter'
import VariableDeclarator from './VariableDeclarator'

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

export type PredicateMatcher = {
  predicate: true
  match: (path: ASTPath<any>, matchSoFar: MatchResult) => boolean
  nodeType?: keyof typeof t.namedTypes | (keyof typeof t.namedTypes)[]
}

export interface CompiledMatcher {
  predicate?: false
  captureAs?: string
  arrayCaptureAs?: string
  match: (path: ASTPath<any>, matchSoFar: MatchResult) => MatchResult
  nodeType?: keyof typeof t.namedTypes | (keyof typeof t.namedTypes)[]
}

const nodeMatchers: Record<
  string,
  (
    query: any,
    options: CompileOptions
  ) => CompiledMatcher | PredicateMatcher | undefined | void
> = {
  BooleanLiteral,
  ClassDeclaration,
  ClassExpression: ClassDeclaration,
  ClassImplements,
  ClassProperty,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  Literal,
  NumericLiteral,
  ObjectExpression,
  ObjectProperty,
  Property: ObjectProperty,
  ObjectTypeProperty,
  RegExpLiteral,
  StringLiteral,
  TSExpressionWithTypeArguments,
  TSPropertySignature,
  TSTypeParameter,
  TSTypeReference,
  TypeParameter,
  VariableDeclarator,
}

function convertPredicateMatcher(
  query: ASTNode,
  matcher: PredicateMatcher,
  debug: Debugger
): CompiledMatcher {
  return {
    nodeType: matcher.nodeType,
    match: (path: ASTPath<any>, matchSoFar: MatchResult): MatchResult => {
      debug('%s (specific)', query.type)
      const result = matcher.match(path, matchSoFar)
      if (result) {
        if (result === true) debug('  matched')
        return typeof result === 'object' ? result : matchSoFar || {}
      } else {
        if (result === false) debug(`  didn't match`)
        return null
      }
    },
  }
}

export default function compileMatcher(
  query: ASTNode | ASTNode[],
  compileOptions: RootCompileOptions = {}
): CompiledMatcher {
  const { debug = _debug } = compileOptions
  if (Array.isArray(query)) {
    return compileGenericArrayMatcher(query, { ...compileOptions, debug })
  } else if (nodeMatchers[query.type]) {
    const matcher = nodeMatchers[query.type](query, {
      ...compileOptions,
      debug,
    })
    if (matcher) {
      return matcher.predicate
        ? convertPredicateMatcher(query, matcher, debug)
        : matcher
    }
  } else if (t.namedTypes.Function.check(query)) {
    return compileFunctionMatcher(query, { ...compileOptions, debug })
  }
  return compileGenericNodeMatcher(query, { ...compileOptions, debug })
}
