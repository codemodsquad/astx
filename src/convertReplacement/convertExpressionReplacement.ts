import { Node } from '../types'
import convertToExpression from './convertToExpression'

export default function convertExpressionReplacement(node: Node): Node {
  return convertToExpression(node) || node
}
