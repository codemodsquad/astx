import { TemplateLiteral, NodePath } from '../types'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement, ReplaceableMatch } from './'
import { unescapeIdentifier } from './Capture'
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
      const captureAs = getCaptureAs(quasi.value.cooked)
      if (captureAs) {
        return {
          generate: (match: ReplaceableMatch): TemplateLiteral => {
            const captured = match.stringCaptures?.[captureAs]
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
