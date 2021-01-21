import { ASTPath, BooleanLiteral } from 'jscodeshift'
import { NonCapturingMatcher } from './'

export default function matchBooleanLiteral(
  query: BooleanLiteral
): NonCapturingMatcher {
  return {
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return node.type === 'BooleanLiteral' && query.value === node.value
    },
    nodeType: 'BooleanLiteral',
  }
}
