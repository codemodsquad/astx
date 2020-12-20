import { ASTPath, StringLiteral } from 'jscodeshift'

export default function matchStringLiteral(
  path: ASTPath<any>,
  query: StringLiteral
): boolean {
  const { node } = path
  if (node.type !== 'StringLiteral') return false
  return node.type === 'StringLiteral' && query.value === node.value
}
