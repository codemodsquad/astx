import * as b from '@babel/types'
import * as t from 'ast-types'
import * as k from 'ast-types/gen/kinds'

export type NodeType =
  | keyof typeof t.namedTypes
  | b.Node['type']
  | keyof b.Aliases

export type Node = b.Node | k.NodeKind

export interface NodePath<T = Node> {
  node: T
  parentPath: NodePath | null | undefined
  container?: Node | Node[]
  key?: string | number
  listKey?: string | number
  wrapped: any
  get<K extends keyof T>(
    key: K
  ): T[K] extends Array<Node | null | undefined>
    ? Array<NodePath<T[K][number]>>
    : T[K] extends Array<Node | null | undefined> | null | undefined
    ? Array<NodePath<NonNullable<T[K]>[number]>> | NodePath<null | undefined>
    : T[K] extends Node | null | undefined
    ? NodePath<T[K]>
    : never
  get(key: string | number): NodePath<any> | NodePath<any>[]

  remove(): void
  replaceWith(replacement: T | Node | NodePath): unknown
  replaceWithMultiple(
    replacement: T[] | Node[] | NodePath<T>[] | NodePath[]
  ): unknown
  insertBefore(nodes: T | Node | readonly T[] | readonly Node[]): unknown
}
export type Block =
  | b.Block
  | k.BlockStatementKind
  | k.ProgramKind
  | k.TSModuleBlockKind
export type Expression = b.Expression | k.ExpressionKind
export type Statement = b.Statement | k.StatementKind
export type BooleanLiteral = b.BooleanLiteral | k.BooleanLiteralKind
export type CallExpression = b.CallExpression | k.CallExpressionKind
export type ClassDeclaration = b.ClassImplements | k.ClassImplementsKind
export type ClassImplements = b.ClassImplements | k.ClassImplementsKind
export type ClassProperty = b.ClassProperty | k.ClassPropertyKind
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
export type ObjectProperty = b.ObjectProperty | k.ObjectPropertyKind
export type ObjectTypeProperty = b.ObjectTypeProperty | k.ObjectTypePropertyKind
export type RegExpLiteral = b.RegExpLiteral | k.RegExpLiteralKind
export type StringLiteral = b.StringLiteral | k.StringLiteralKind
export type SpreadProperty = k.SpreadPropertyKind
export type SpreadElement = b.SpreadElement | k.SpreadElementKind
export type TemplateLiteral = b.TemplateLiteral | k.TemplateLiteralKind
export type TSExpressionWithTypeArguments =
  | b.TSExpressionWithTypeArguments
  | k.TSExpressionWithTypeArgumentsKind
export type TSPropertySignature =
  | b.TSPropertySignature
  | k.TSPropertySignatureKind
export type TSTypeAnnotation = b.TSTypeAnnotation | k.TSTypeAnnotationKind
export type TSTypeParameter = b.TSTypeParameter | k.TSTypeParameterKind
export type TSTypeReference = b.TSTypeReference | k.TSTypeReferenceKind
export type TypeAnnotation = b.TypeAnnotation | k.TypeAnnotationKind
export type TypeParameter = b.TypeParameter | k.TypeParameterKind
export type VariableDeclarator = b.VariableDeclarator | k.VariableDeclaratorKind
export type VariableDeclaration =
  | b.VariableDeclaration
  | k.VariableDeclarationKind
