import * as b from '@babel/types'
import * as t from 'ast-types'

export type NodeType =
  | keyof typeof t.namedTypes
  | b.Node['type']
  | keyof b.Aliases

export type Node = b.Node | t.namedTypes.ASTNode

export interface NodePath<T = Node> {
  node: T
  parentPath: NodePath | null | undefined
  container?: Node | Node[]
  key?: string | number
  listKey?: string | number
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
export type Block = b.Block | t.namedTypes.Block
export type Expression = b.Expression | t.namedTypes.Expression
export type Statement =
  | b.Statement
  | t.namedTypes.BlockStatement
  | t.namedTypes.BreakStatement
  | t.namedTypes.ContinueStatement
  | t.namedTypes.DebuggerStatement
  | t.namedTypes.DoWhileStatement
  | t.namedTypes.EmptyStatement
  | t.namedTypes.ExpressionStatement
  | t.namedTypes.ForInStatement
  | t.namedTypes.ForStatement
  | t.namedTypes.FunctionDeclaration
  | t.namedTypes.IfStatement
  | t.namedTypes.LabeledStatement
  | t.namedTypes.ReturnStatement
  | t.namedTypes.SwitchStatement
  | t.namedTypes.ThrowStatement
  | t.namedTypes.TryStatement
  | t.namedTypes.VariableDeclaration
  | t.namedTypes.WhileStatement
  | t.namedTypes.WithStatement
  | t.namedTypes.ClassDeclaration
  | t.namedTypes.ExportAllDeclaration
  | t.namedTypes.ExportDefaultDeclaration
  | t.namedTypes.ExportNamedDeclaration
  | t.namedTypes.ForOfStatement
  | t.namedTypes.ImportDeclaration
  | t.namedTypes.DeclareClass
  | t.namedTypes.DeclareFunction
  | t.namedTypes.DeclareInterface
  | t.namedTypes.DeclareModule
  | t.namedTypes.DeclareModuleExports
  | t.namedTypes.DeclareTypeAlias
  | t.namedTypes.DeclareOpaqueType
  | t.namedTypes.DeclareVariable
  | t.namedTypes.DeclareExportDeclaration
  | t.namedTypes.DeclareExportAllDeclaration
  | t.namedTypes.InterfaceDeclaration
  | t.namedTypes.OpaqueType
  | t.namedTypes.TypeAlias
  | t.namedTypes.EnumDeclaration
  | t.namedTypes.TSDeclareFunction
  | t.namedTypes.TSInterfaceDeclaration
  | t.namedTypes.TSTypeAliasDeclaration
  | t.namedTypes.TSEnumDeclaration
  | t.namedTypes.TSModuleDeclaration
  | t.namedTypes.TSImportEqualsDeclaration
  | t.namedTypes.TSExportAssignment
  | t.namedTypes.TSNamespaceExportDeclaration

export type BooleanLiteral = b.BooleanLiteral | t.namedTypes.BooleanLiteral
export type CallExpression = b.CallExpression | t.namedTypes.CallExpression
export type ClassDeclaration = b.ClassImplements | t.namedTypes.ClassImplements
export type ClassImplements = b.ClassImplements | t.namedTypes.ClassImplements
export type ClassProperty = b.ClassProperty | t.namedTypes.ClassProperty
export type ExpressionStatement =
  | b.ExpressionStatement
  | t.namedTypes.ExpressionStatement
export type FlowType = b.FlowType | t.namedTypes.FlowType
export type Function = b.Function | t.namedTypes.Function
export type FunctionTypeParam =
  | b.FunctionTypeParam
  | t.namedTypes.FunctionTypeParam
export type GenericTypeAnnotation =
  | b.GenericTypeAnnotation
  | t.namedTypes.GenericTypeAnnotation
export type Identifier = b.Identifier | t.namedTypes.Identifier
export type ImportDefaultSpecifier =
  | b.ImportDefaultSpecifier
  | t.namedTypes.ImportDefaultSpecifier
export type ImportDeclaration =
  | b.ImportDeclaration
  | t.namedTypes.ImportDeclaration
export type ImportNamespaceSpecifier =
  | b.ImportNamespaceSpecifier
  | t.namedTypes.ImportNamespaceSpecifier
export type ImportSpecifier = b.ImportSpecifier | t.namedTypes.ImportSpecifier
export type JSXAttribute = b.JSXAttribute | t.namedTypes.JSXAttribute
export type JSXElement = b.JSXElement | t.namedTypes.JSXElement
export type JSXExpressionContainer =
  | b.JSXExpressionContainer
  | t.namedTypes.JSXExpressionContainer
export type JSXIdentifier = b.JSXIdentifier | t.namedTypes.JSXIdentifier
export type JSXText = b.JSXText | t.namedTypes.JSXText
export type NumericLiteral = b.NumericLiteral | t.namedTypes.NumericLiteral
export type ObjectExpression =
  | b.ObjectExpression
  | t.namedTypes.ObjectExpression
export type ObjectMethod = b.ObjectMethod | t.namedTypes.ObjectMethod
export type ObjectProperty = b.ObjectProperty | t.namedTypes.ObjectProperty
export type ObjectTypeProperty =
  | b.ObjectTypeProperty
  | t.namedTypes.ObjectTypeProperty
export type RegExpLiteral = b.RegExpLiteral | t.namedTypes.RegExpLiteral
export type StringLiteral = b.StringLiteral | t.namedTypes.StringLiteral
export type SpreadProperty = t.namedTypes.SpreadProperty
export type SpreadElement = b.SpreadElement | t.namedTypes.SpreadElement
export type TemplateLiteral = b.TemplateLiteral | t.namedTypes.TemplateLiteral
export type TSExpressionWithTypeArguments =
  | b.TSExpressionWithTypeArguments
  | t.namedTypes.TSExpressionWithTypeArguments
export type TSPropertySignature =
  | b.TSPropertySignature
  | t.namedTypes.TSPropertySignature
export type TSTypeAnnotation =
  | b.TSTypeAnnotation
  | t.namedTypes.TSTypeAnnotation
export type TSTypeParameter = b.TSTypeParameter | t.namedTypes.TSTypeParameter
export type TSTypeReference = b.TSTypeReference | t.namedTypes.TSTypeReference
export type TypeAnnotation = b.TypeAnnotation | t.namedTypes.TypeAnnotation
export type TypeParameter = b.TypeParameter | t.namedTypes.TypeParameter
export type VariableDeclarator =
  | b.VariableDeclarator
  | t.namedTypes.VariableDeclarator
export type VariableDeclaration =
  | b.VariableDeclaration
  | t.namedTypes.VariableDeclaration
