import { TemplateLiteral, NodePath } from '../types'
import { CompileOptions, CompiledMatcher } from '.'
import {
  compileStringPlaceholderMatcher,
  unescapeIdentifier,
} from './Placeholder'

function generateValue(cooked: string): { raw: string; cooked: string } {
  return { raw: cooked.replace(/\\|`|\${/g, '\\$&'), cooked }
}

export default function matchTemplateLiteral(
  path: NodePath<TemplateLiteral, TemplateLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TemplateLiteral = path.value

  const placeholderMatcher = compileStringPlaceholderMatcher(
    path,
    (node: TemplateLiteral) =>
      node.quasis.length === 1 ? node.quasis[0].value.cooked ?? null : null,
    compileOptions,
    { nodeType: 'TemplateLiteral' }
  )

  if (placeholderMatcher) return placeholderMatcher

  if (pattern.quasis.length === 1) {
    const [quasi] = pattern.quasis
    if (quasi.value.cooked) {
      const unescaped = unescapeIdentifier(quasi.value.cooked)
      if (unescaped !== quasi.value.cooked) {
        quasi.value = generateValue(unescaped)
      }
    }
  }
}
