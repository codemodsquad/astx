import j, { Literal, ASTPath } from 'jscodeshift'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match } from '../find'
import { unescapeIdentifier } from './Capture'
import cloneNode from '../util/cloneNode'

export default function compileLiteralReplacement(
  path: ASTPath<Literal>
): CompiledReplacement | void {
  const pattern = path.node
  if (typeof pattern.value === 'string') {
    const captureAs = getCaptureAs(pattern.value)
    if (captureAs) {
      return {
        generate: (match: Match): Literal => {
          const captured = match.stringCaptures?.[captureAs]
          return captured ? j.literal(captured) : cloneNode(pattern)
        },
      }
    }
    pattern.value = unescapeIdentifier(pattern.value)
  }
}
