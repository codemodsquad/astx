import { ASTPath, NumericLiteral } from 'jscodeshift'

export default function matchNumericLiteral(
  path: ASTPath<any>,
  query: NumericLiteral
): boolean {
  const { node } = path
  return node.type === 'NumericLiteral' && query.value === node.value
}
