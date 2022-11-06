import { TemplateLiteral, NodePath } from '../types'
import { getPlaceholder } from '../compileMatcher/Placeholder'
import { CompiledReplacement, ReplaceableMatch } from './'
import { unescapeIdentifier } from './Placeholder'
import cloneNode from '../util/cloneNode'
import * as t from '@babel/types'

function generateValue(cooked: string): { raw: string; cooked: string } {
  return { raw: cooked.replace(/\\|`|\${/g, '\\$&'), cooked }
}

export default function compileTemplateLiteralReplacement(
  path: NodePath<TemplateLiteral>
): CompiledReplacement | void {
  const pattern = path.value
  if (pattern.quasis.length === 1) {
    const [quasi] = pattern.quasis
    if (quasi.value.cooked) {
      const placeholder = getPlaceholder(quasi.value.cooked)
      if (placeholder) {
        return {
          generate: (match: ReplaceableMatch): TemplateLiteral => {
            const captured = match.stringCaptures?.[placeholder]
            return captured
              ? t.templateLiteral(
                  [t.templateElement(generateValue(captured), true)],
                  []
                )
              : cloneNode(pattern)
          },
        }
      }
      const unescaped = unescapeIdentifier(quasi.value.cooked)
      if (unescaped !== quasi.value.cooked)
        quasi.value = generateValue(unescaped)
    }
  }
}
