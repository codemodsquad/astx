import { ASTPath, Literal } from 'jscodeshift'
import { NonCapturingMatcher } from './index'
import sortFlags from './sortFlags'

export default function matchLiteral(query: Literal): NonCapturingMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    if (node.type !== 'Literal') return false
    if (query.regex) {
      return (
        node.regex != null &&
        node.regex.pattern === query.regex.pattern &&
        sortFlags(node.regex.flags) === sortFlags(query.regex.flags)
      )
    }
    return node.value === query.value
  }
}
