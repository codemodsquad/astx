import { ASTPath, NumericLiteral } from 'jscodeshift'
import { NonCapturingMatcher } from './index'

export default function matchNumericLiteral(
  query: NumericLiteral
): NonCapturingMatcher {
  return {
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return node.type === 'NumericLiteral' && query.value === node.value
    },
    nodeType: 'NumericLiteral',
  }
}
