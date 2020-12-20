import { ASTPath, Literal } from 'jscodeshift'
import sortFlags from './sortFlags'

export default function matchLiteral(
  path: ASTPath<any>,
  query: Literal
): boolean {
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
