import { NodePath, NumericLiteral } from '../types'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'

export default function matchNumericLiteral(
  path: NodePath<NumericLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: NumericLiteral = path.node

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { node } = path

        return node?.type === 'NumericLiteral' && pattern.value === node.value
      },
      nodeType: 'NumericLiteral',
    },
    compileOptions
  )
}
