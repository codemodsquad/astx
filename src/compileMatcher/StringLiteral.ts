import { ASTPath, StringLiteral } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'
import { compileStringCaptureMatcher } from './Capture'

export default function matchStringLiteral(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: StringLiteral = path.node
  const captureMatcher = compileStringCaptureMatcher(
    pattern,
    (pattern) => pattern.value,
    compileOptions
  )
  if (captureMatcher) return captureMatcher

  return convertPredicateMatcher(
    pattern,
    {
      predicate: true,

      match: (path: ASTPath): boolean => {
        const { node } = path
        return node.type === 'StringLiteral' && pattern.value === node.value
      },

      nodeType: 'StringLiteral',
    },
    compileOptions
  )
}
