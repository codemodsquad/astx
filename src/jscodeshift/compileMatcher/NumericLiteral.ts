import { ASTPath, NumericLiteral } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'

export default function matchNumericLiteral(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: NumericLiteral = path.node

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
