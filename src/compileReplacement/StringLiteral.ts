import j, { StringLiteral } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match, StatementsMatch } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import { unescapeIdentifier } from './Capture'

export default function compileStringLiteralReplacement(
  query: StringLiteral
): CompiledReplacement<StringLiteral> | void {
  const captureAs = getCaptureAs(query.value)
  if (captureAs) {
    return {
      generate: (match: Match<any> | StatementsMatch): StringLiteral => {
        const captured = match.stringCaptures?.[captureAs]
        return captured ? j.stringLiteral(captured) : cloneDeep(query)
      },
    }
  }
  query.value = unescapeIdentifier(query.value)
}
