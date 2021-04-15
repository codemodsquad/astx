import { NodePath, RegExpLiteral } from '../variant'
import sortFlags from './sortFlags'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchRegExpLiteral(
  query: RegExpLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  const queryFlags = sortFlags(query.flags)
  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: NodePath<any>): boolean => {
        const { node } = path
        return (
          node.type === 'RegExpLiteral' &&
          node.pattern === query.pattern &&
          sortFlags(node.flags) === queryFlags
        )
      },

      nodeType: 'RegExpLiteral',
    },
    compileOptions
  )
}
