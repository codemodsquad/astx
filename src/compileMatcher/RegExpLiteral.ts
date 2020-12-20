import { ASTPath, RegExpLiteral } from 'jscodeshift'
import sortFlags from './sortFlags'
import { CompiledMatcher } from './index'

export default function matchRegExpLiteral(
  query: RegExpLiteral
): CompiledMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return (
      node.type === 'RegExpLiteral' &&
      node.pattern === query.pattern &&
      sortFlags(node.flags) === sortFlags(query.flags)
    )
  }
}
