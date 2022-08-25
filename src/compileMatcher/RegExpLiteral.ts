import { NodePath, RegExpLiteral } from '../types'
import sortFlags from './sortFlags'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'

export default function matchRegExpLiteral(
  path: NodePath<RegExpLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: RegExpLiteral = path.node
  const queryFlags = sortFlags(pattern.flags)

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { node } = path

        return (
          node?.type === 'RegExpLiteral' &&
          node.pattern === pattern.pattern &&
          sortFlags(node.flags) === queryFlags
        )
      },
      nodeType: 'RegExpLiteral',
    },
    compileOptions
  )
}
