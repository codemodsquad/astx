import { NodePath, NumericLiteral } from '../types'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'

export default function matchNumericLiteral(
  path: NodePath<NumericLiteral, NumericLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: NumericLiteral = path.value
  const n = compileOptions.backend.t.namedTypes

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { value: node } = path

        return n.NumericLiteral.check(node) && pattern.value === node.value
      },
      nodeType: 'NumericLiteral',
    },
    compileOptions
  )
}
