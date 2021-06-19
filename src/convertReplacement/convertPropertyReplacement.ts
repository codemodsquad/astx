import j, { ASTNode } from 'jscodeshift'
import convertToIdentifierExpressionPair from './convertToIdentifierExpressionPair'
import convertToExpression from './convertToExpression'

export default function convertPropertyReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'SpreadProperty':
    case 'SpreadElement':
    case 'ObjectProperty':
    case 'Property':
      return node
    case 'ObjectTypeSpreadProperty': {
      const expr = convertToExpression(node)
      if (expr) return j.SpreadProperty(expr)
    }
  }
  const keyValue = convertToIdentifierExpressionPair(node)
  if (keyValue) return j.objectProperty(keyValue[0], keyValue[1])
  return node
}
