import { ASTPath, NumericLiteral } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchNumericLiteral(
  pattern: NumericLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  return convertPredicateMatcher(
    pattern,
    {
      predicate: true,

      match: (path: ASTPath): boolean => {
        const { node } = path
        return node.type === 'NumericLiteral' && pattern.value === node.value
      },

      nodeType: 'NumericLiteral',
    },
    compileOptions
  )
}
