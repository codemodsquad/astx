import * as b from '@babel/types'
import * as t from 'ast-types'
import * as k from 'ast-types/lib/gen/kinds'

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export type Location = {
  start?: number | null
  end?: number | null
  startLine?: number | null
  startColumn?: number | null
  endLine?: number | null
  endColumn?: number | null
}

export interface Debugger {
  (formatter: any, ...args: any[]): void
  enabled?: boolean
}

export interface NodePath<N = Node, V = any> {
  value: V
  node: N
  parentPath: NodePath | null
  parent: NodePath | null
  name: string | number | null
  get<K extends keyof V>(
    key: K
  ): V[K] extends Node ? NodePath<V[K], V[K]> : NodePath<N, V[K]>
  get(...names: (string | number)[]): NodePath
  each(
    callback: (path: NodePath<N, ArrayElement<V>>) => any,
    context?: any
  ): void
  map<E>(
    callback: (path: NodePath<N, ArrayElement<V>>) => E,
    context?: any
  ): E[]
  filter(
    callback: (path: NodePath<N, ArrayElement<V>>) => boolean,
    context?: any
  ): NodePath<N, ArrayElement<V>>[]
  shift(): ArrayElement<V> | undefined
  unshift(...args: ArrayElement<V>[]): number
  push(...args: ArrayElement<V>[]): number
  pop(): ArrayElement<V> | undefined
  insertAt(index: number, ...args: ArrayElement<V>[]): this
  insertBefore(...args: V[]): NodePath
  insertAfter(...args: V[]): NodePath
  replace(replacement?: V, ...more: V[]): NodePath<N, V>[]
  prune(): NodePath | undefined
}

export function pathIs<N, T>(
  path: NodePath<N>,
  namedType: { check: (value: any) => value is T }
): path is NodePath<N, T> {
  return namedType.check(path.value)
}

export type NodeType =
  | keyof typeof t.namedTypes
  | b.Node['type']
  | keyof b.Aliases

export type Node = b.Node | k.NodeKind
export type Comment = b.Comment | k.CommentKind

export type File = b.File | k.FileKind
export type Block =
  | b.Block
  | k.BlockStatementKind
  | k.ProgramKind
  | k.TSModuleBlockKind
export type Expression = b.Expression | k.ExpressionKind
export type Statement = b.Statement | k.StatementKind
export type AssignmentPattern = b.AssignmentPattern | k.AssignmentPatternKind
export type BooleanLiteral = b.BooleanLiteral | k.BooleanLiteralKind
export type CallExpression = b.CallExpression | k.CallExpressionKind
export type ClassDeclaration = b.ClassImplements | k.ClassImplementsKind
export type ClassImplements = b.ClassImplements | k.ClassImplementsKind
export type ClassProperty = b.ClassProperty | k.ClassPropertyKind
export type ExportDeclaration = b.ExportDeclaration | k.ExportDeclarationKind
export type ExportDefaultSpecifier =
  | b.ExportDefaultSpecifier
  | k.ExportDefaultSpecifierKind
export type ExportNamedDeclaration =
  | b.ExportNamedDeclaration
  | k.ExportNamedDeclarationKind
export type ExportSpecifier = b.ExportSpecifier | k.ExportSpecifierKind
export type ExpressionStatement =
  | b.ExpressionStatement
  | k.ExpressionStatementKind
export type FlowType = b.FlowType | k.FlowTypeKind
export type TSType = b.TSType | k.TSTypeKind
export type Function = b.Function | k.FunctionKind
export type FunctionTypeParam = b.FunctionTypeParam | k.FunctionTypeParamKind
export type GenericTypeAnnotation =
  | b.GenericTypeAnnotation
  | k.GenericTypeAnnotationKind
export type Identifier = b.Identifier | k.IdentifierKind
export type ImportDefaultSpecifier =
  | b.ImportDefaultSpecifier
  | k.ImportDefaultSpecifierKind
export type ImportDeclaration = b.ImportDeclaration | k.ImportDeclarationKind
export type ImportNamespaceSpecifier =
  | b.ImportNamespaceSpecifier
  | k.ImportNamespaceSpecifierKind
export type ImportSpecifier = b.ImportSpecifier | k.ImportSpecifierKind
export type JSXAttribute = b.JSXAttribute | k.JSXAttributeKind
export type JSXElement = b.JSXElement | k.JSXElementKind
export type JSXExpressionContainer =
  | b.JSXExpressionContainer
  | k.JSXExpressionContainerKind
export type JSXIdentifier = b.JSXIdentifier | k.JSXIdentifierKind
export type JSXText = b.JSXText | k.JSXTextKind
export type NumericLiteral = b.NumericLiteral | k.NumericLiteralKind
export type ObjectExpression = b.ObjectExpression | k.ObjectExpressionKind
export type ObjectMethod = b.ObjectMethod | k.ObjectMethodKind
export type ObjectProperty =
  | b.ObjectProperty
  | k.ObjectPropertyKind
  | k.PropertyKind
export type ObjectTypeProperty = b.ObjectTypeProperty | k.ObjectTypePropertyKind
export type RegExpLiteral = b.RegExpLiteral | k.RegExpLiteralKind
export type StringLiteral = b.StringLiteral | k.StringLiteralKind
export type SpreadElement = b.SpreadElement | k.SpreadElementKind
export type TemplateLiteral = b.TemplateLiteral | k.TemplateLiteralKind
export type TSExpressionWithTypeArguments =
  | b.TSExpressionWithTypeArguments
  | k.TSExpressionWithTypeArgumentsKind
export type TSFunctionType = b.TSFunctionType | k.TSFunctionTypeKind
export type TSPropertySignature =
  | b.TSPropertySignature
  | k.TSPropertySignatureKind
export type TSTypeAnnotation = b.TSTypeAnnotation | k.TSTypeAnnotationKind
export type TSTypeParameter = b.TSTypeParameter | k.TSTypeParameterKind
export type TSTypeReference = b.TSTypeReference | k.TSTypeReferenceKind
export type TypeAnnotation = b.TypeAnnotation | k.TypeAnnotationKind
export type TypeParameter = b.TypeParameter | k.TypeParameterKind
export type TypeParameterInstantiation =
  | b.TypeParameterInstantiation
  | k.TypeParameterInstantiationKind
export type VariableDeclarator = b.VariableDeclarator | k.VariableDeclaratorKind
export type VariableDeclaration =
  | b.VariableDeclaration
  | k.VariableDeclarationKind
