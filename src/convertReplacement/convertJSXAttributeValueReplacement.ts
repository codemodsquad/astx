import { Node } from '../types'
import * as t from '@babel/types'

import convertToExpression from './convertToExpression'

export default function convertJSXAttributeValueReplacement(node: Node): Node {
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') return t.jsxText(node.value)
      break
    case 'StringLiteral':
    case 'JSXText':
      return t.jsxText(node.value)
  }
  const expr = convertToExpression(node)
  return expr ? t.jsxExpressionContainer(expr as t.Expression) : node
}
