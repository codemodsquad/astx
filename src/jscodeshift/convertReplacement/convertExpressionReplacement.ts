import { ASTNode } from 'jscodeshift'
import convertToExpression from './convertToExpression'

export default function convertExpressionReplacement(node: ASTNode): ASTNode {
  return (convertToExpression(node) as any) || node
}
