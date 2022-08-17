import { ASTPath, BooleanLiteral } from 'jscodeshift'
import { CompiledMatcher, convertPredicateMatcher, CompileOptions } from './'

export default function matchBooleanLiteral(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: BooleanLiteral = path.node

  return convertPredicateMatcher(
    path,
    {
      match: (path: ASTPath): boolean => {
        const { node } = path

        return node.type === 'BooleanLiteral' && pattern.value === node.value
      },
      nodeType: 'BooleanLiteral',
    },
    compileOptions
  )
}
