import { ASTPath, BooleanLiteral } from 'jscodeshift'
import { PredicateMatcher } from './'

export default function matchBooleanLiteral(
  query: BooleanLiteral
): PredicateMatcher {
  return {
    predicate: true,
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return node.type === 'BooleanLiteral' && query.value === node.value
    },
    nodeType: 'BooleanLiteral',
  }
}
