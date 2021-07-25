import { ASTNode, Identifier, Expression } from '../variant'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'
import { t } from '../variant'

export default function convertToIdentifierExpressionPair(
  node: ASTNode
): [Identifier, Expression] | void {
  const result = convertToJSXIdentifierNameExpressionPair(node)
  if (result && result[0].indexOf('-') < 0)
    return [t.identifier(result[0]), result[1]]
}
