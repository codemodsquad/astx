import * as t from 'ast-types'
import { ASTNode } from 'jscodeshift'

function addFieldNames(type: ASTNode['type'], ...fields: string[]): string[] {
  const fieldNames = t.getFieldNames({ type })
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
  'typeArguments',
  'typeParameters'
)
const newExpression = addFieldNames('NewExpression', 'typeParameters')
const importSpecifier = addFieldNames('ImportSpecifier', 'importKind')

export default function getFieldNames(node: ASTNode): string[] {
  switch (node.type) {
    case 'ArrayPattern':
      return arrayPattern
    case 'ObjectPattern':
      return objectPattern
    case 'CallExpression':
      return callExpression
    case 'NewExpression':
      return newExpression
    case 'ImportSpecifier':
      return importSpecifier
    default:
      return t.getFieldNames(node)
  }
}