import t from 'ast-types'

function addFieldNames(type: ASTNode['type'], ...fields: string[]): string[] {
  const fieldNames = t.getFieldNames({ type })
  for (const field of fields) {
    if (!fieldNames.includes(field)) fieldNames.push(field)
  }
  return fieldNames
}

const arrayPattern = addFieldNames('ArrayPattern', 'typeAnnotation')
const objectPattern = addFieldNames('ObjectPattern', 'typeAnnotation')
const callExpression = addFieldNames('CallExpression', 'typeAnnotation')

export default function getFieldNames(node: ASTNode): string[] {
  switch (node.type) {
    case 'ArrayPattern':
      return arrayPattern
    case 'ObjectPattern':
      return objectPattern
    case 'CallExpression':
      return callExpression
    default:
      return t.getFieldNames(node)
  }
}
