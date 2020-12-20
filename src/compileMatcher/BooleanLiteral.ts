import { ASTPath, BooleanLiteral } from 'jscodeshift'
import { CompiledMatcher } from './index'

export default function matchBooleanLiteral(
  query: BooleanLiteral
): CompiledMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return node.type === 'BooleanLiteral' && query.value === node.value
  }
}
