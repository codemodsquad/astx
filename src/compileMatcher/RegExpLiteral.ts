import { NodePath, RegExpLiteral } from '../types'
import sortFlags from './sortFlags'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'

export default function matchRegExpLiteral(
  path: NodePath<RegExpLiteral, RegExpLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: RegExpLiteral = path.value
  const queryFlags = sortFlags(pattern.flags)
  const n = compileOptions.backend.t.namedTypes

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { value: node } = path

        return (
          n.RegExpLiteral.check(node) &&
          node.pattern === pattern.pattern &&
          sortFlags(node.flags) === queryFlags
        )
      },
      nodeType: 'RegExpLiteral',
    },
    compileOptions
  )
}
