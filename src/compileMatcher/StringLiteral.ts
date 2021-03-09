import { ASTPath, StringLiteral } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchStringLiteral(
  query: StringLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: ASTPath<any>): boolean => {
        const { node } = path
        return node.type === 'StringLiteral' && query.value === node.value
      },

      nodeType: 'StringLiteral',
    },
    compileOptions
  )
}
