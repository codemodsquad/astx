import { ASTPath, BooleanLiteral } from 'jscodeshift'
import { CompiledMatcher, convertPredicateMatcher, CompileOptions } from './'

export default function matchBooleanLiteral(
  pattern: BooleanLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    pattern,
    {
      predicate: true,
      match: (path: ASTPath): boolean => {
        const { node } = path
        return node.type === 'BooleanLiteral' && pattern.value === node.value
      },
      nodeType: 'BooleanLiteral',
    },
    compileOptions
  )
}
