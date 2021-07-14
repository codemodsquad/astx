import jscodeshift, {
  ASTPath,
  ASTNode,
  Flow,
  FlowType,
  Expression,
  Statement,
  TSType,
  Function as _Function,
  VariableDeclarator,
  ArrayExpression,
  Property,
  CallExpression,
  ExpressionStatement,
  Parser as JscodeshiftParser,
} from 'jscodeshift'
import { visit, Visitor, namedTypes } from 'ast-types'
import * as astTypes from 'ast-types'

import { getParserAsync } from 'babel-parse-wild-code'

export { jscodeshift as t }

export type NodeType = keyof typeof namedTypes

export { ASTPath, ASTNode }

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
} from 'jscodeshift'

export type Types = typeof jscodeshift

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

function addFieldNames(type: ASTNode['type'], ...fields: string[]): string[] {
  const fieldNames = astTypes.getFieldNames({ type })
  for (const field of fields) {
    if (!fieldNames.includes(field)) fieldNames.push(field)
  }
  return fieldNames
}

const arrayPattern = addFieldNames('ArrayPattern', 'typeAnnotation')
const objectPattern = addFieldNames('ObjectPattern', 'typeAnnotation')
const callExpression = addFieldNames(
  'CallExpression',
  'typeAnnotation',
  'typeArguments'
)
const newExpression = addFieldNames('NewExpression', 'typeParameters')

export function getFieldNames<Node extends ASTNode>(
  node: Node
): (keyof Node)[] {
  switch (node.type) {
    case 'ArrayPattern':
      return arrayPattern as any
    case 'ObjectPattern':
      return objectPattern as any
    case 'CallExpression':
      return callExpression as any
    case 'NewExpression':
      return newExpression as any
    default:
      return astTypes.getFieldNames(node) as any
  }
}

export function getFieldValue<Node extends ASTNode, Key extends keyof ASTNode>(
  node: Node,
  field: Key
): Node[Key] {
  return astTypes.getFieldValue(node, field)
}

export function isNode(node: ASTNode): boolean {
  return namedTypes.Node.check(node)
}

export function isFlow(node: any): node is Flow {
  return namedTypes.Flow.check(node)
}

export function isFlowType(node: any): node is FlowType {
  return namedTypes.FlowType.check(node)
}

export function isTSType(node: any): node is TSType {
  return namedTypes.TSType.check(node)
}

export function isExpression(node: any): node is Expression {
  return namedTypes.Expression.check(node)
}

export function isStatement(node: any): node is Statement {
  return namedTypes.Statement.check(node)
}

export function isFunction(node: any): node is _Function {
  return namedTypes.Function.check(node)
}

export function isVariableDeclarator(node: any): node is VariableDeclarator {
  return namedTypes.VariableDeclarator.check(node)
}

export function isArrayExpression(node: any): node is ArrayExpression {
  return namedTypes.ArrayExpression.check(node)
}

export function isProperty(node: any): node is Property {
  return namedTypes.Property.check(node)
}

export function isCallExpression(node: any): node is CallExpression {
  return namedTypes.CallExpression.check(node)
}

export function isExpressionStatement(node: any): node is ExpressionStatement {
  return namedTypes.ExpressionStatement.check(node)
}

export function isType(node: ASTNode, type: NodeType): boolean {
  return namedTypes[type].check(node)
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
