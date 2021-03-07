import { ASTPath, RegExpLiteral } from 'jscodeshift'
import sortFlags from './sortFlags'
import { PredicateMatcher } from './index'

export default function matchRegExpLiteral(
  query: RegExpLiteral
): PredicateMatcher {
  const queryFlags = sortFlags(query.flags)
  return {
    predicate: true,
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      return (
        node.type === 'RegExpLiteral' &&
        node.pattern === query.pattern &&
        sortFlags(node.flags) === queryFlags
      )
    },
    nodeType: 'RegExpLiteral',
  }
}
