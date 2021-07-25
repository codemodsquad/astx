import { ASTNode, Expression } from '../variant'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'

export default function convertToIdentifierNameExpressionPair(
  node: ASTNode
): [string, Expression] | void {
  const result = convertToJSXIdentifierNameExpressionPair(node)
  if (result && result[0].indexOf('-') < 0) return result
}
