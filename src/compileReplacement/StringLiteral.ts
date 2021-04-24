import j, { StringLiteral, ASTPath } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match, StatementsMatch } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import { unescapeIdentifier } from './Capture'

export default function compileStringLiteralReplacement(
  path: ASTPath<StringLiteral>
): CompiledReplacement | void {
  const pattern = path.node
  const captureAs = getCaptureAs(pattern.value)
  if (captureAs) {
    return {
      generate: (match: Match | StatementsMatch): StringLiteral => {
        const captured = match.stringCaptures?.[captureAs]
        return captured ? j.stringLiteral(captured) : cloneDeep(pattern)
      },
    }
  }
  pattern.value = unescapeIdentifier(pattern.value)
}
