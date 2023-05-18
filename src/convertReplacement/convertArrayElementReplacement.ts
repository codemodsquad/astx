import { Node } from '../types'
import * as t from '@babel/types'
import convertToExpression from './convertToExpression'

export default function convertArrayElementReplacement(node: Node): Node {
  switch (node.type) {
    case 'SpreadElement':
      return node
    case 'TSRestType':
    case 'ObjectTypeSpreadProperty': {
      const expr = convertToExpression(node)
      if (expr) return t.spreadElement(expr as t.Expression)
    }
  }
  return convertToExpression(node) || node
}
