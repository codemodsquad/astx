import {
  CompileReplacementOptions,
  CompiledReplacement,
  ReplaceableMatch,
} from '.'
import { Node, NodePath, getAstxMatchInfo } from '../types'
import {
  getArrayPlaceholder,
  getPlaceholder,
  getRestPlaceholder,
  isCapturePlaceholder,
  unescapeIdentifier,
} from '../compileMatcher/Placeholder'
import createReplacementConverter, { bulkConvert } from '../convertReplacement'
import cloneNode from '../util/cloneNode'
export { unescapeIdentifier }

export function compileArrayPlaceholderReplacement(
  pattern: NodePath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const arrayPlaceholder =
    getArrayPlaceholder(identifier) || getRestPlaceholder(identifier)
  if (arrayPlaceholder && isCapturePlaceholder(arrayPlaceholder)) {
    const convertReplacement = createReplacementConverter(pattern)
    return {
      generate: (match: ReplaceableMatch): Node | Node[] => {
        const captures = match.arrayCaptures?.[arrayPlaceholder]
        if (captures) {
          return [
            ...bulkConvert(
              captures.map((c) => cloneNode(c)),
              convertReplacement
            ),
          ]
        }
        return [...bulkConvert(cloneNode(pattern.value), convertReplacement)]
      },
    }
  }
}

export default function compilePlaceholderReplacement(
  pattern: NodePath,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const placeholder = getPlaceholder(identifier)
  if (placeholder && isCapturePlaceholder(placeholder)) {
    const convertReplacement = createReplacementConverter(pattern)
    return {
      generate: (match: ReplaceableMatch): Node | Node[] => {
        const capture = match.captures?.[placeholder]
        if (capture) {
          const clone = cloneNode(capture)
          const astx = getAstxMatchInfo(capture)
          if (astx?.subcapture) return convertReplacement(astx.subcapture)
          return convertReplacement(clone)
        }
        return convertReplacement(cloneNode(pattern.value))
      },
    }
  }
  return compileArrayPlaceholderReplacement(
    pattern,
    identifier,
    compileReplacementOptions
  )
}
