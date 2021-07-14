import { ASTNode } from '../variant'
import convertToIdentifierExpressionPair from './convertToIdentifierExpressionPair'
import convertToExpression from './convertToExpression'
import { t } from '../variant'

export default function convertPropertyReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'SpreadProperty':
    case 'SpreadElement':
    case 'ObjectProperty':
    case 'Property':
      return node
    case 'ObjectTypeSpreadProperty': {
      const expr = convertToExpression(node)
      if (expr) return t.spreadProperty(expr as any)
    }
  }
  const keyValue = convertToIdentifierExpressionPair(node)
  if (keyValue) return t.objectProperty(keyValue[0], keyValue[1] as any)
  return node
}
