import j, { ASTNode, Identifier, Expression } from 'jscodeshift'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'

export default function convertToIdentifierExpressionPair(
  node: ASTNode
): [Identifier, Expression] | void {
  const result = convertToJSXIdentifierNameExpressionPair(node)
  if (result && result[0].indexOf('-') < 0)
    return [j.identifier(result[0]), result[1]]
}
