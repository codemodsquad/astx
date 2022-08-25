import { NodePath, BooleanLiteral } from '../types'
import { CompiledMatcher, convertPredicateMatcher, CompileOptions } from '.'

export default function matchBooleanLiteral(
  path: NodePath<BooleanLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern = path.node

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { node } = path

        return (
          node?.type === 'BooleanLiteral' &&
          pattern.value === (node as BooleanLiteral).value
        )
      },
      nodeType: 'BooleanLiteral',
    },
    compileOptions
  )
}
