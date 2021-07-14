import { ASTNode } from '../variant'
import convertExpressionReplacement from './convertExpressionReplacement'
import { t } from '../variant'

export default function convertJSXChildReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'JSXElement':
    case 'JSXEmptyExpression':
    case 'JSXFragment':
    case 'JSXText':
    case 'JSXExpressionContainer':
      return node
  }
  return t.jsxExpressionContainer(convertExpressionReplacement(node) as any)
}
