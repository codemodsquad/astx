import { NodePath, StringLiteral } from '../variant'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'
import { compileStringCaptureMatcher } from './Capture'

export default function matchStringLiteral(
  query: StringLiteral,
  compileOptions: CompileOptions
): CompiledMatcher {
  const captureMatcher = compileStringCaptureMatcher(
    query,
    (query) => query.value,
    compileOptions
  )
  if (captureMatcher) return captureMatcher

  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: NodePath<any>): boolean => {
        const { node } = path
        return node.type === 'StringLiteral' && query.value === node.value
      },

      nodeType: 'StringLiteral',
    },
    compileOptions
  )
}
