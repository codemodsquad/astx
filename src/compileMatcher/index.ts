import { NodePath, NodeType } from '../types'
import * as t from 'ast-types'
import __debug, { Debugger } from 'debug'
import { Backend } from '../Backend'
import BooleanLiteral from './BooleanLiteral'
import CallExpression from './CallExpression'
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
import JSXElement from './JSXElement'
import JSXExpressionContainer from './JSXExpressionContainer'
import JSXIdentifier from './JSXIdentifier'
import JSXText from './JSXText'
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
import TSTypeAnnotation from './TSTypeAnnotation'
import TSTypeParameter from './TSTypeParameter'
import TSTypeReference from './TSTypeReference'
import TypeAnnotation from './TypeAnnotation'
import TypeParameter from './TypeParameter'
import VariableDeclarator from './VariableDeclarator'

const _debug = __debug('astx:match')

export type RootCompileOptions = {
  where?: { [captureName: string]: (path: NodePath) => boolean }
  debug?: Debugger
  backend: Backend
}

export type CompileOptions = {
  where?: { [captureName: string]: (path: NodePath) => boolean }
  debug: Debugger
  backend: Backend
}

export type Captures = Record<string, NodePath>
export type ArrayCaptures = Record<string, NodePath[]>
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
  match: (path: NodePath, matchSoFar: MatchResult) => boolean
  nodeType?: keyof typeof t.namedTypes | (keyof typeof t.namedTypes)[]
}

export interface CompiledNodeMatcher {
  type: 'node'
  pattern: NodePath
  optional?: true
  captureAs?: string
  arrayCaptureAs?: string
  restCaptureAs?: string
  match: (path: NodePath, matchSoFar: MatchResult) => MatchResult
  nodeType?: NodeType | NodeType[]
}

export interface CompiledArrayMatcher {
  type: 'array'
  pattern: NodePath[]
  match: (path: NodePath[], matchSoFar: MatchResult) => MatchResult
  nodeType?: NodeType | NodeType[]
}

export type CompiledMatcher = CompiledNodeMatcher | CompiledArrayMatcher

const nodeMatchers: Record<
  string,
  (
    path: NodePath<any>,
    options: CompileOptions
  ) => CompiledMatcher | undefined | void
> = {
  BooleanLiteral,
  CallExpression,
  ClassImplements,
  ClassProperty,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportSpecifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXText,
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
  TSTypeAnnotation,
  TSTypeParameter,
  TSTypeReference,
  TypeAnnotation,
  TypeParameter,
  VariableDeclarator,
}

export function convertPredicateMatcher(
  pattern: NodePath,
  matcher: PredicateMatcher,
  { debug }: CompileOptions
): CompiledMatcher {
  return {
    type: 'node',
    pattern,
    nodeType: matcher.nodeType,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('%s (specific)', pattern.node.type)
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
  path: NodePath,
  rootCompileOptions: RootCompileOptions
): CompiledNodeMatcher
export default function compileMatcher(
  paths: NodePath[],
  rootCompileOptions: RootCompileOptions
): CompiledArrayMatcher
export default function compileMatcher(
  path: NodePath | NodePath[],
  rootCompileOptions: RootCompileOptions
): CompiledMatcher {
  const { debug = _debug } = rootCompileOptions
  const compileOptions = { ...rootCompileOptions, debug }
  if (Array.isArray(path)) {
    return compileGenericArrayMatcher(path, compileOptions)
  } else if (nodeMatchers[path.node.type]) {
    const matcher = nodeMatchers[path.node.type](path, compileOptions)
    if (matcher) return matcher
  }
  return compileGenericNodeMatcher(path, compileOptions)
}
