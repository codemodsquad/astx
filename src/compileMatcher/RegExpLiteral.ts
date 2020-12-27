import { ASTPath, RegExpLiteral } from 'jscodeshift'
import sortFlags from './sortFlags'
import { NonCapturingMatcher } from './index'

export default function matchRegExpLiteral(
  query: RegExpLiteral
): NonCapturingMatcher {
  const queryFlags = sortFlags(query.flags)
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return (
      node.type === 'RegExpLiteral' &&
      node.pattern === query.pattern &&
      sortFlags(node.flags) === queryFlags
    )
  }
}
