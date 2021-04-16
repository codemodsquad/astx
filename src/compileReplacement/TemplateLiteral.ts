import j, { TemplateLiteral } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match, StatementsMatch } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import { unescapeIdentifier } from './Capture'

function generateValue(cooked: string): { raw: string; cooked: string } {
  return { raw: cooked.replace(/\\|`|\${/g, '\\$&'), cooked }
}

export default function compileTemplateLiteralReplacement(
  query: TemplateLiteral
): CompiledReplacement<TemplateLiteral> | void {
  if (query.quasis.length === 1) {
    const [quasi] = query.quasis
    const captureAs = getCaptureAs(quasi.value.cooked)
    if (captureAs) {
      return {
        generate: (match: Match<any> | StatementsMatch): TemplateLiteral => {
          const captured = match.stringCaptures?.[captureAs]
          return captured
            ? j.templateLiteral(
                [j.templateElement(generateValue(captured), true)],
                []
              )
            : cloneDeep(query)
        },
      }
    }
    const unescaped = unescapeIdentifier(quasi.value.cooked)
    if (unescaped !== quasi.value.cooked) quasi.value = generateValue(unescaped)
  }
}
