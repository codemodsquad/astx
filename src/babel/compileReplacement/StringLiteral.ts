import { StringLiteral, ASTPath } from '../variant'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match } from '../find'
import { unescapeIdentifier } from './Capture'
import cloneNode from '../util/cloneNode'
import { t } from '../variant'

export default function compileStringLiteralReplacement(
  path: ASTPath<StringLiteral>
): CompiledReplacement | void {
  const pattern = path.node
  const captureAs = getCaptureAs(pattern.value)
  if (captureAs) {
    return {
      generate: (match: Match): StringLiteral => {
        const captured = match.stringCaptures?.[captureAs]
        return captured ? t.stringLiteral(captured) : cloneNode(pattern)
      },
    }
  }
  pattern.value = unescapeIdentifier(pattern.value)
}
