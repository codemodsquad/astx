import { NodeType, NodePath, Node as ASTNode } from '../variant'
import __debug, { Debugger } from 'debug'
import BooleanLiteral from './BooleanLiteral'
import ClassImplements from './ClassImplements'
import ClassProperty from './ClassProperty'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import ExpressionStatement from './ExpressionStatement'
import FunctionTypeParam from './FunctionTypeParam'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import ImportSpecifier from './ImportSpecifier'
import JSXAttribute from './JSXAttribute'
import JSXExpressionContainer from './JSXExpressionContainer'
import JSXIdentifier from './JSXIdentifier'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import ObjectExpression from './ObjectExpression'
import ObjectProperty from './ObjectProperty'
import ObjectTypeProperty from './ObjectTypeProperty'
import RegExpLiteral from './RegExpLiteral'
import StringLiteral from './StringLiteral'
import TemplateLiteral from './TemplateLiteral'
import TSExpressionWithTypeArguments from './TSExpressionWithTypeArguments'
import TSPropertySignature from './TSPropertySignature'
import TSTypeParameter from './TSTypeParameter'
import TSTypeReference from './TSTypeReference'
import TypeParameter from './TypeParameter'
import VariableDeclarator from './VariableDeclarator'

const _debug = __debug('astx:match')

export type RootCompileOptions = {
  where?: { [captureName: string]: (path: NodePath<any>) => boolean }
  debug?: Debugger
}

export type CompileOptions = {
  where?: { [captureName: string]: (path: NodePath<any>) => boolean }
  debug: Debugger
}

export type Captures = Record<string, NodePath<any>>
export type ArrayCaptures = Record<string, NodePath<any>[]>
export type StringCaptures = Record<string, string>

export type MatchResult = {
  captures?: Captures
  arrayCaptures?: ArrayCaptures
  stringCaptures?: StringCaptures
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
    if (result.stringCaptures) {
      if (!current) current = {}
      if (!current.stringCaptures) current.stringCaptures = {}
      Object.assign(current.stringCaptures, result.stringCaptures)
    }
  }
  return current
}

export type PredicateMatcher = {
  predicate: true
  match: (path: NodePath<any>, matchSoFar: MatchResult) => boolean
  nodeType?: NodeType | NodeType[]
}

export interface CompiledMatcher {
  predicate?: false
  captureAs?: string
  arrayCaptureAs?: string
  match: (path: NodePath<any>, matchSoFar: MatchResult) => MatchResult
  nodeType?: NodeType | NodeType[]
}

export function isCompiledMatcher(obj: unknown): obj is CompiledMatcher {
  return (
    obj instanceof Object &&
    Object.getPrototypeOf(obj) === Object.getPrototypeOf({}) &&
    typeof (obj as any).match === 'function'
  )
}

const nodeMatchers: Record<
  string,
  (query: any, options: CompileOptions) => CompiledMatcher | undefined | void
> = {
  BooleanLiteral,
  ClassImplements,
  ClassProperty,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportSpecifier,
  JSXAttribute,
  JSXExpressionContainer,
  JSXIdentifier,
  Literal,
  NumericLiteral,
  ObjectExpression,
  ObjectProperty,
  Property: ObjectProperty,
  ObjectTypeProperty,
  RegExpLiteral,
  StringLiteral,
  TemplateLiteral,
  TSExpressionWithTypeArguments,
  TSPropertySignature,
  TSTypeParameter,
  TSTypeReference,
  TypeParameter,
  VariableDeclarator,
}

export function convertPredicateMatcher(
  query: ASTNode,
  matcher: PredicateMatcher,
  { debug }: CompileOptions
): CompiledMatcher {
  return {
    nodeType: matcher.nodeType,
    match: (path: NodePath<any>, matchSoFar: MatchResult): MatchResult => {
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
  rootCompileOptions: RootCompileOptions = {}
): CompiledMatcher {
  const { debug = _debug } = rootCompileOptions
  const compileOptions = { ...rootCompileOptions, debug }
  if (Array.isArray(query)) {
    return compileGenericArrayMatcher(query, compileOptions)
  } else if (nodeMatchers[query.type]) {
    const matcher = nodeMatchers[query.type](query, compileOptions)
    if (matcher) return matcher
  }
  return compileGenericNodeMatcher(query, { ...compileOptions, debug })
}
