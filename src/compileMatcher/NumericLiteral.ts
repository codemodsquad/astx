import { NodePath, NumericLiteral } from '../variant'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchNumericLiteral(
  query: NumericLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: NodePath<any>): boolean => {
        const { node } = path
        return node.type === 'NumericLiteral' && query.value === node.value
      },

      nodeType: 'NumericLiteral',
    },
    compileOptions
  )
}
