import { NodePath, BooleanLiteral } from '../types'
import { CompiledMatcher, convertPredicateMatcher, CompileOptions } from '.'

export default function matchBooleanLiteral(
  path: NodePath<BooleanLiteral, BooleanLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { value: node } = path

        return n.BooleanLiteral.check(node) && pattern.value === node.value
      },
      nodeType: 'BooleanLiteral',
    },
    compileOptions
  )
}
