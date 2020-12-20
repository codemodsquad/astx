import { ASTPath, BooleanLiteral } from 'jscodeshift'

export default function matchBooleanLiteral(
  path: ASTPath<any>,
  query: BooleanLiteral
): boolean {
  const { node } = path
  return node.type === 'BooleanLiteral' && query.value === node.value
}
