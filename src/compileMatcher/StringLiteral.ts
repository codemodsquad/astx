import { ASTPath, StringLiteral } from 'jscodeshift'
import { NonCapturingMatcher } from './index'

export default function matchStringLiteral(
  query: StringLiteral
): NonCapturingMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return node.type === 'StringLiteral' && query.value === node.value
  }
}
