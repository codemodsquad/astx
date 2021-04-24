import j, { Literal, ASTPath } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match, StatementsMatch } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import { unescapeIdentifier } from './Capture'

export default function compileLiteralReplacement(
  path: ASTPath<Literal>
): CompiledReplacement<Literal> | void {
  const pattern = path.node
  if (typeof pattern.value === 'string') {
    const captureAs = getCaptureAs(pattern.value)
    if (captureAs) {
      return {
        generate: (match: Match<any> | StatementsMatch): Literal => {
          const captured = match.stringCaptures?.[captureAs]
          return captured ? j.literal(captured) : cloneDeep(pattern)
        },
      }
    }
    pattern.value = unescapeIdentifier(pattern.value)
  }
}
