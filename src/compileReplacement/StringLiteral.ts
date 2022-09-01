import { StringLiteral, NodePath } from '../types'
import { getCaptureAs } from '../compileMatcher/Capture'
import { CompiledReplacement, ReplaceableMatch } from './'
import { unescapeIdentifier } from './Capture'
import cloneNode from '../util/cloneNode'
import * as t from '@babel/types'

export default function compileStringLiteralReplacement(
  path: NodePath<StringLiteral>
): CompiledReplacement | void {
  const pattern = path.value
  const captureAs = getCaptureAs(pattern.value)
  if (captureAs) {
    return {
      generate: (match: ReplaceableMatch): StringLiteral => {
        const captured = match.stringCaptures?.[captureAs]
        return captured ? t.stringLiteral(captured) : cloneNode(pattern)
      },
    }
  }
  pattern.value = unescapeIdentifier(pattern.value)
}
