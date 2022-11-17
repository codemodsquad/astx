import { Node, NodePath, Debugger } from '../types'
import __debug from 'debug'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import compileGenericArrayReplacement from './GenericArrayReplacement'
import ClassImplements from './ClassImplements'
import ClassProperty from './ClassProperty'
import ExportNamedDeclaration from './ExportNamedDeclaration'
import ExportDefaultSpecifier from './ExportDefaultSpecifier'
import ExportSpecifier from './ExportSpecifier'
import ExpressionStatement from './ExpressionStatement'
import FunctionTypeParam from './FunctionTypeParam'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import ImportDeclaration from './ImportDeclaration'
import ImportDefaultSpecifier from './ImportDefaultSpecifier'
import ImportSpecifier from './ImportSpecifier'
import JSXAttribute from './JSXAttribute'
import JSXExpressionContainer from './JSXExpressionContainer'
import JSXIdentifier from './JSXIdentifier'
import ObjectProperty from './ObjectProperty'
import ObjectTypeProperty from './ObjectTypeProperty'
import Property from './Property'
import SpreadElement from './SpreadElement'
import StringLiteral from './StringLiteral'
import TemplateLiteral from './TemplateLiteral'
import TSExpressionWithTypeArguments from './TSExpressionWithTypeArguments'
import TSPropertySignature from './TSPropertySignature'
import TSTypeParameter from './TSTypeParameter'
import TSTypeReference from './TSTypeReference'
import TypeParameter from './TypeParameter'
import VariableDeclarator from './VariableDeclarator'
import { Backend } from '../backend/Backend'

const _debug = __debug('astx:compileReplacement')

export interface ReplaceableMatch {
  captures?: Record<string, Node>
  arrayCaptures?: Record<string, Node[]>
  stringCaptures?: Record<string, string>
}

export interface CompiledReplacement {
  generate: (match: ReplaceableMatch) => Node | Node[]
}

export type RootCompileReplacementOptions = {
  debug?: Debugger
  backend: Backend
}

export type CompileReplacementOptions = {
  debug: Debugger
  backend: Backend
}

const nodeCompilers: Record<
  string,
  (
    pattern: NodePath<any>,
    options: CompileReplacementOptions
  ) => CompiledReplacement | undefined | void
> = {
  ClassImplements,
  ClassProperty,
  ExportNamedDeclaration,
  ExportDefaultSpecifier,
  ExportSpecifier,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  JSXAttribute,
  JSXExpressionContainer,
  JSXIdentifier,
  ObjectProperty,
  ObjectTypeProperty,
  Property,
  SpreadElement,
  StringLiteral,
  TemplateLiteral,
  TSExpressionWithTypeArguments,
  TSPropertySignature,
  TSTypeParameter,
  TSTypeReference,
  TypeParameter,
  VariableDeclarator,
}

export default function compileReplacement(
  pattern: NodePath | NodePath<Node, Node[]> | NodePath[],
  rootCompileReplacementOptions: RootCompileReplacementOptions
): CompiledReplacement {
  const { debug = _debug } = rootCompileReplacementOptions
  const compileOptions = { ...rootCompileReplacementOptions, debug }
  if (Array.isArray(pattern) || Array.isArray(pattern.value)) {
    return compileGenericArrayReplacement(pattern, compileOptions) as any
  }
  if (nodeCompilers[pattern.value.type]) {
    const replacement = nodeCompilers[pattern.value.type](
      pattern,
      compileOptions
    )
    if (replacement) return replacement
  }
  return compileGenericNodeReplacement(pattern, compileOptions)
}
