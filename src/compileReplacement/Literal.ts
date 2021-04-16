import j, { Literal } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match, StatementsMatch } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import { unescapeIdentifier } from './Capture'

export default function compileLiteralReplacement(
  query: Literal
): CompiledReplacement<Literal> | void {
  if (typeof query.value === 'string') {
    const captureAs = getCaptureAs(query.value)
    if (captureAs) {
      return {
        generate: (match: Match<any> | StatementsMatch): Literal => {
          const captured = match.stringCaptures?.[captureAs]
          return captured ? j.literal(captured) : cloneDeep(query)
        },
      }
    }
    query.value = unescapeIdentifier(query.value)
  }
}
