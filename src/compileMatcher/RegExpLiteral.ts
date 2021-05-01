import { ASTPath, RegExpLiteral } from 'jscodeshift'
import sortFlags from './sortFlags'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchRegExpLiteral(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: RegExpLiteral = path.node
  const queryFlags = sortFlags(pattern.flags)
  return convertPredicateMatcher(
    pattern,
    {
      predicate: true,

      match: (path: ASTPath): boolean => {
        const { node } = path
        return (
          node.type === 'RegExpLiteral' &&
          node.pattern === pattern.pattern &&
          sortFlags(node.flags) === queryFlags
        )
      },

      nodeType: 'RegExpLiteral',
    },
    compileOptions
  )
}
