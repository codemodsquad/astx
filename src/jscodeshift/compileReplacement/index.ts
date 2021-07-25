import { ASTNode, ASTPath } from '../variant'
import { Match } from '../find'
import __debug, { Debugger } from 'debug'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import compileGenericArrayReplacement from './GenericArrayReplacement'
import ClassImplements from './ClassImplements'
import ClassProperty from './ClassProperty'
import ExpressionStatement from './ExpressionStatement'
import FunctionTypeParam from './FunctionTypeParam'
import GenericTypeAnnotation from './GenericTypeAnnotation'
import Identifier from './Identifier'
import ImportDefaultSpecifier from './ImportDefaultSpecifier'
import ImportSpecifier from './ImportSpecifier'
import JSXAttribute from './JSXAttribute'
import JSXExpressionContainer from './JSXExpressionContainer'
import JSXIdentifier from './JSXIdentifier'
import Literal from './Literal'
import ObjectProperty from './ObjectProperty'
import ObjectTypeProperty from './ObjectTypeProperty'
import Property from './Property'
import SpreadElement from './SpreadElement'
import SpreadProperty from './SpreadProperty'
import StringLiteral from './StringLiteral'
import TemplateLiteral from './TemplateLiteral'
import TSExpressionWithTypeArguments from './TSExpressionWithTypeArguments'
import TSPropertySignature from './TSPropertySignature'
import TSTypeParameter from './TSTypeParameter'
import TSTypeReference from './TSTypeReference'
import TypeParameter from './TypeParameter'
import VariableDeclarator from './VariableDeclarator'

const _debug = __debug('astx:compileReplacement')

export interface CompiledReplacement {
  generate: (match: Match) => ASTNode | ASTNode[]
}

export type RootCompileReplacementOptions = {
  debug?: Debugger
}

export type CompileReplacementOptions = {
  debug: Debugger
}

const nodeCompilers: Record<
  string,
  (
    pattern: ASTPath<any>,
    options: CompileReplacementOptions
  ) => CompiledReplacement | undefined | void
> = {
  ClassImplements,
  ClassProperty,
  ExpressionStatement,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportDefaultSpecifier,
  ImportSpecifier,
  JSXAttribute,
  JSXExpressionContainer,
  JSXIdentifier,
  Literal,
  ObjectProperty,
  ObjectTypeProperty,
  Property,
  SpreadElement,
  SpreadProperty,
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
  pattern: ASTPath | ASTPath[],
  rootCompileReplacementOptions: RootCompileReplacementOptions = {}
): CompiledReplacement {
  const { debug = _debug } = rootCompileReplacementOptions
  const compileOptions = { ...rootCompileReplacementOptions, debug }
  if (Array.isArray(pattern) || Array.isArray(pattern.value)) {
    return compileGenericArrayReplacement(pattern as any, compileOptions) as any
  }
  const nodePattern = pattern as ASTPath
  if (nodeCompilers[nodePattern.node.type]) {
    const replacement = nodeCompilers[nodePattern.node.type](
      pattern,
      compileOptions
    )
    if (replacement) return replacement
  }
  return compileGenericNodeReplacement(nodePattern, compileOptions)
}
