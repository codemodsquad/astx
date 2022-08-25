import { Node, Expression } from '../types'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'

export default function convertToIdentifierNameExpressionPair(
  node: Node
): [string, Expression] | void {
  const result = convertToJSXIdentifierNameExpressionPair(node)
  if (result && result[0].indexOf('-') < 0) return result
}
