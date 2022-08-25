import { NodePath } from '../types'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement } from './'
import { Match } from '../find'
import { unescapeIdentifier } from './Capture'
import cloneNode from '../util/cloneNode'
import * as t from 'ast-types'

export default function compileLiteralReplacement(
  path: NodePath<t.namedTypes.Literal>
): CompiledReplacement | void {
  const pattern = path.node
  if (typeof pattern.value === 'string') {
    const captureAs = getCaptureAs(pattern.value)
    if (captureAs) {
      return {
        generate: (match: Match): t.namedTypes.Literal => {
          const captured = match.stringCaptures?.[captureAs]
          return captured ? t.builders.literal(captured) : cloneNode(pattern)
        },
      }
    }
    pattern.value = unescapeIdentifier(pattern.value)
  }
}
