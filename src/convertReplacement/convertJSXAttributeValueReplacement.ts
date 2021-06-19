import j, { ASTNode } from 'jscodeshift'

import convertToExpression from './convertToExpression'

export default function convertJSXAttributeValueReplacement(
  node: ASTNode
): ASTNode {
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') return j.jsxText(node.value)
      break
    case 'StringLiteral':
    case 'JSXText':
      return j.jsxText(node.value)
  }
  return j.jsxExpressionContainer(convertToExpression(node))
}
