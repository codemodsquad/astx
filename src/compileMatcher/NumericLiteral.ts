import { ASTPath, NumericLiteral } from 'jscodeshift'
import { PredicateMatcher } from './index'

export default function matchNumericLiteral(
  query: NumericLiteral
): PredicateMatcher {
  return {
    predicate: true,
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return node.type === 'NumericLiteral' && query.value === node.value
    },
    nodeType: 'NumericLiteral',
  }
}
