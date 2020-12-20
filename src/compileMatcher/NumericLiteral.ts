import { ASTPath, NumericLiteral } from 'jscodeshift'
import { CompiledMatcher } from './index'

export default function matchNumericLiteral(
  query: NumericLiteral
): CompiledMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return node.type === 'NumericLiteral' && query.value === node.value
  }
}
