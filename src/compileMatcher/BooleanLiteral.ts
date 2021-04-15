import { NodePath, BooleanLiteral } from '../variant'
import { CompiledMatcher, convertPredicateMatcher, CompileOptions } from './'

export default function matchBooleanLiteral(
  query: BooleanLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    query,
    {
      predicate: true,
      match: (path: NodePath<any>): boolean => {
        const { node } = path
        return node.type === 'BooleanLiteral' && query.value === node.value
      },
      nodeType: 'BooleanLiteral',
    },
    compileOptions
  )
}
