import { ASTPath, StringLiteral } from 'jscodeshift'
import { PredicateMatcher } from './index'

export default function matchStringLiteral(
  query: StringLiteral
): PredicateMatcher {
  return {
    predicate: true,
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return node.type === 'StringLiteral' && query.value === node.value
    },
    nodeType: 'StringLiteral',
  }
}
