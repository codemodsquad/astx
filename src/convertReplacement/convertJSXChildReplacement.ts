import { Node } from '../types'
import * as t from '@babel/types'
import convertExpressionReplacement from './convertExpressionReplacement'

export default function convertJSXChildReplacement(node: Node): Node {
  switch (node.type) {
    case 'JSXElement':
    case 'JSXEmptyExpression':
    case 'JSXFragment':
    case 'JSXText':
    case 'JSXExpressionContainer':
      return node
  }
  return t.jsxExpressionContainer(
    convertExpressionReplacement(node) as t.Expression
  )
}
