import { ASTPath, RegExpLiteral } from 'jscodeshift'
import sortFlags from './sortFlags'

export default function matchRegExpLiteral(
  path: ASTPath<any>,
  query: RegExpLiteral
): boolean {
  const { node } = path
  return (
    node.type === 'RegExpLiteral' &&
    node.pattern === query.pattern &&
    sortFlags(node.flags) === sortFlags(query.flags)
  )
}
