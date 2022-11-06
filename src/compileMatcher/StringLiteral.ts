import { NodePath, StringLiteral } from '../types'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'
import {
  compileStringPlaceholderMatcher,
  unescapeIdentifier,
} from './Placeholder'

export default function matchStringLiteral(
  path: NodePath<StringLiteral, StringLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: StringLiteral = path.value
  const n = compileOptions.backend.t.namedTypes
  const placeholderMatcher = compileStringPlaceholderMatcher(
    path,
    (pattern) => pattern.value,
    compileOptions,
    { nodeType: 'StringLiteral' }
  )

  if (placeholderMatcher) return placeholderMatcher

  pattern.value = unescapeIdentifier(pattern.value)

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { value: node } = path

        return n.StringLiteral.check(node) && pattern.value === node.value
      },
      nodeType: 'StringLiteral',
    },
    compileOptions
  )
}
