import { TemplateLiteral, NodePath } from '../types'
import { CompileOptions, CompiledMatcher } from '.'
import { compileStringCaptureMatcher, unescapeIdentifier } from './Capture'

function generateValue(cooked: string): { raw: string; cooked: string } {
  return { raw: cooked.replace(/\\|`|\${/g, '\\$&'), cooked }
}

export default function matchTemplateLiteral(
  path: NodePath<TemplateLiteral, TemplateLiteral>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TemplateLiteral = path.value

  const captureMatcher = compileStringCaptureMatcher(
    path,
    (node: TemplateLiteral) =>
      node.quasis.length === 1 ? node.quasis[0].value.cooked ?? null : null,
    compileOptions
  )

  if (captureMatcher) return captureMatcher

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
