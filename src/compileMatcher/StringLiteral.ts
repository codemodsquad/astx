import { ASTPath, StringLiteral } from 'jscodeshift'
import { CompiledMatcher } from './index'

export default function matchStringLiteral(
  query: StringLiteral
): CompiledMatcher {
  return (path: ASTPath<any>): boolean => {
    const { node } = path
    return node.type === 'StringLiteral' && query.value === node.value
  }
}
