import { ASTNode } from '../variant'
import convertToExpression from './convertToExpression'
import { t } from '../variant'

export default function convertJSXAttributeValueReplacement(
  node: ASTNode
): ASTNode {
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') return t.jsxText(node.value)
      break
    case 'StringLiteral':
    case 'JSXText':
      return t.jsxText(node.value)
  }
  const expr = convertToExpression(node)
  return expr ? t.jsxExpressionContainer(expr as any) : node
}
