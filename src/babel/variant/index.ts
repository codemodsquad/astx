import { Node as ASTNode } from '@babel/types'
import { NodePath as ASTPath } from '@babel/traverse'

import { getParserAsync } from 'babel-parse-wild-code'

import * as t from '@babel/types'

export type NodeType = keyof typeof namedTypes

export { ASTPath, ASTNode, t }

export {
  BooleanLiteral,
  CallExpression,
  ClassDeclaration,
  ClassImplements,
  ClassProperty,
  Expression,
  ExpressionStatement,
  File,
  FunctionTypeParam,
  GenericTypeAnnotation,
  Identifier,
  ImportDefaultSpecifier,
  ImportSpecifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXText,
  Literal,
  NumericLiteral,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  ObjectTypeProperty,
  Property,
  RegExpLiteral,
  SpreadElement,
  SpreadProperty,
  Statement,
  StringLiteral,
  TemplateLiteral,
  TSExpressionWithTypeArguments,
  TSPropertySignature,
  TSTypeParameter,
  TSTypeReference,
  TypeParameter,
  VariableDeclarator,
  isNode,
  isFlow,
  isFlowType,
  isTSType,
  isExpression,
  isStatement,
  isFunction,
  isVariableDeclarator,
  isArrayExpression,
  isProperty,
  isCallExpression,
  isExpressionStatement,
} from '@babel/types'

export type Types = typeof t

export function getPath<Node extends ASTNode>(node: Node): ASTPath<Node> {
  return jscodeshift([node]).paths()[0]
}

export function forEachNode(
  paths: ASTPath<any>[],
  nodeTypes: NodeType[],
  iteratee: (path: ASTPath<any>) => void
): void {
  function visitNode(this: any, path: ASTPath<any>) {
    this.traverse(path)
    iteratee(path)
  }
  const visitor: Visitor<any> = {}
  for (const nodeType of nodeTypes) {
    ;(visitor as any)[`visit${nodeType}`] = visitNode
  }

  paths.forEach((path: ASTPath<any>) => visit(path as any, visitor))
}

export function getFieldNames<Node extends ASTNode>(
  node: Node
): (keyof Node)[] {
  return Object.keys(t.NODE_FIELDS[node.type]) as any[]
}

export function getFieldValue<Node extends ASTNode, Key extends keyof ASTNode>(
  node: Node,
  field: Key
): Node[Key] {
  return node[field] ?? (t.NODE_FIELDS[node.type] as any)[field].default
}

export function isType(node: ASTNode, type: NodeType): boolean {
  return t[`is${String(type)}`](node)
}

export function toPaths(nodes: ASTNode | ASTNode[]): ASTPath<any>[] {
  return jscodeshift(nodes).paths()
}

export function generate(node: ASTNode | ASTPath<any>): string {
  return jscodeshift(node).toSource()
}

export interface Parser {
  parse: (code: string) => ASTNode
}

export async function createParser(
  file: string,
  parser: string | JscodeshiftParser | null | undefined
): Promise<Parser> {
  if (!parser) parser = await getParserAsync(file, { tokens: true })
  const j = jscodeshift.withParser(parser)
  return (typeof parser === 'string'
    ? { parse: (src: string) => j(src).nodes()[0] }
    : parser) as any
}
