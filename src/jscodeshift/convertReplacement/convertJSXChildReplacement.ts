import j, { ASTNode } from 'jscodeshift'
import convertExpressionReplacement from './convertExpressionReplacement'

export default function convertJSXChildReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'JSXElement':
    case 'JSXEmptyExpression':
    case 'JSXFragment':
    case 'JSXText':
    case 'JSXExpressionContainer':
      return node
  }
  return j.jsxExpressionContainer(convertExpressionReplacement(node) as any)
}
