import { Node } from '../types'
import * as t from '@babel/types'
import convertToIdentifierExpressionPair from './convertToIdentifierExpressionPair'
import convertToExpression from './convertToExpression'

export default function convertPropertyReplacement(node: Node): Node {
  switch (node.type) {
    case 'SpreadElement':
    case 'ObjectProperty':
      return node
    case 'TSRestType':
    case 'ObjectTypeSpreadProperty': {
      const expr = convertToExpression(node)
      if (expr) return t.spreadElement(expr as t.Expression)
    }
  }
  const keyValue = convertToIdentifierExpressionPair(node)
  if (keyValue)
    return t.objectProperty(
      keyValue[0] as t.Identifier,
      keyValue[1] as t.Expression
    )
  return node
}
