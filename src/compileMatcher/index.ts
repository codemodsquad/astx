import { NodeType, NodePath, Node, Debugger } from '../types'
import * as t from 'ast-types'
import __debug from 'debug'
import { Backend } from '../backend/Backend'
import AssignmentPattern from './AssignmentPattern'
import BooleanLiteral from './BooleanLiteral'
import CallExpression from './CallExpression'
import ClassImplements from './ClassImplements'
import ClassProperty from './ClassProperty'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import ExportSpecifier from './ExportSpecifier'
import ExpressionStatement from './ExpressionStatement'
import FunctionTypeParam from './FunctionTypeParam'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import ImportDeclaration from './ImportDeclaration'
import ImportSpecifier from './ImportSpecifier'
import JSXAttribute from './JSXAttribute'
import JSXElement from './JSXElement'
import JSXExpressionContainer from './JSXExpressionContainer'
import JSXIdentifier from './JSXIdentifier'
import JSXText from './JSXText'
import NumericLiteral from './NumericLiteral'
import ObjectProperty from './ObjectProperty'
import ObjectTypeProperty from './ObjectTypeProperty'
import RegExpLiteral from './RegExpLiteral'
import SpreadElement from './SpreadElement'
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
import { isCapturePlaceholder } from './Placeholder'

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

function hasCapturePlaceholder(captures?: Captures | ArrayCaptures): boolean {
  for (const key in captures) {
    if (isCapturePlaceholder(key)) return true
  }
  return false
}

export function mergeCaptures(...results: MatchResult[]): MatchResult {
  let current: MatchResult = null
  for (const result of results) {
    if (!result) continue
    if (!current) current = {}
    if (result.captures && hasCapturePlaceholder(result.captures)) {
      if (!current) current = {}
      if (!current.captures) current.captures = {}
      for (const [key, value] of Object.entries(result.captures)) {
        if (isCapturePlaceholder(key)) current.captures[key] = value
      }
    }
    if (result.arrayCaptures && hasCapturePlaceholder(result.arrayCaptures)) {
      if (!current) current = {}
      if (!current.arrayCaptures) current.arrayCaptures = {}
      for (const [key, value] of Object.entries(result.arrayCaptures)) {
        if (isCapturePlaceholder(key)) current.arrayCaptures[key] = value
      }
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

export interface CompiledMatcher {
  pattern: NodePath<Node, Node> | NodePath<Node, Node>[]
  optional?: true
  placeholder?: string
  arrayPlaceholder?: string
  restPlaceholder?: string
  flag?: '$Ordered' | '$Unordered'
  match: (path: NodePath, matchSoFar: MatchResult) => MatchResult
  nodeType?: NodeType | NodeType[]
}

const nodeMatchers: Record<
  string,
  (
    path: NodePath<any, any>,
    options: CompileOptions
  ) => CompiledMatcher | undefined | void
> = {
  AssignmentPattern,
  BooleanLiteral,
  CallExpression,
  ClassImplements,
  ClassProperty,
  ExportSpecifier,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXText,
  NumericLiteral,
  // ObjectExpression,
  ObjectProperty,
  ObjectTypeProperty,
  RegExpLiteral,
  SpreadElement,
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
    pattern,
    nodeType: matcher.nodeType,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('%s (specific)', pattern.value.type)
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
): CompiledMatcher {
  const { debug = _debug } = rootCompileOptions
  const compileOptions = { ...rootCompileOptions, debug }
  if (Array.isArray(path.value)) {
    return compileGenericArrayMatcher(path, compileOptions)
  } else if (nodeMatchers[path.value.type]) {
    const matcher = nodeMatchers[path.value.type](path, compileOptions)
    if (matcher) return matcher
  }
  return compileGenericNodeMatcher(path, compileOptions)
}
