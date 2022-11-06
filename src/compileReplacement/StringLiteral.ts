import { StringLiteral, NodePath } from '../types'
import { getPlaceholder } from '../compileMatcher/Placeholder'
import { CompiledReplacement, ReplaceableMatch } from './'
import { unescapeIdentifier } from './Placeholder'
import cloneNode from '../util/cloneNode'
import * as t from '@babel/types'

export default function compileStringLiteralReplacement(
  path: NodePath<StringLiteral>
): CompiledReplacement | void {
  const pattern = path.value
  const placeholder = getPlaceholder(pattern.value)
  if (placeholder) {
    return {
      generate: (match: ReplaceableMatch): StringLiteral => {
        const captured = match.stringCaptures?.[placeholder]
        return captured ? t.stringLiteral(captured) : cloneNode(pattern)
      },
    }
  }
  pattern.value = unescapeIdentifier(pattern.value)
}
