import { ASTPath, NumericLiteral } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchNumericLiteral(
  query: NumericLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: ASTPath<any>): boolean => {
        const { node } = path
        return node.type === 'NumericLiteral' && query.value === node.value
      },

      nodeType: 'NumericLiteral',
    },
    compileOptions
  )
}
