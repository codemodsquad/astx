import { CompileReplacementOptions, CompiledReplacement } from './'
import { ASTNode, ASTPath } from '../variant'
import { Match } from '../find'
import {
  getArrayCaptureAs,
  getCaptureAs,
  unescapeIdentifier,
} from '../compileMatcher/Capture'
import createReplacementConverter, { bulkConvert } from '../convertReplacement'
import cloneNode from '../util/cloneNode'
export { unescapeIdentifier }

export function compileArrayCaptureReplacement(
  pattern: ASTPath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const arrayCaptureAs = getArrayCaptureAs(identifier)
  if (arrayCaptureAs) {
    const convertReplacement = createReplacementConverter(pattern)
    return {
      generate: (match: Match): ASTNode | ASTNode[] => {
        const captures = match.arrayCaptures?.[arrayCaptureAs]
        if (captures) {
          return [
            ...bulkConvert(
              captures.map((c) => cloneNode(c)),
              convertReplacement
            ),
          ]
        }
        return [...bulkConvert(cloneNode(pattern.node), convertReplacement)]
      },
    }
  }
}

export default function compileCaptureReplacement(
  pattern: ASTPath,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const captureAs = getCaptureAs(identifier)
  if (captureAs) {
    const convertReplacement = createReplacementConverter(pattern)
    return {
      generate: (match: Match): ASTNode | ASTNode[] => {
        const capture = match.captures?.[captureAs]
        if (capture) {
          const clone = cloneNode(capture)
          if ((capture as any).astx?.excludeTypeAnnotationFromCapture)
            delete (clone as any).typeAnnotation
          return convertReplacement(clone)
        }
        return convertReplacement(cloneNode(pattern.node))
      },
    }
  }
  return compileArrayCaptureReplacement(
    pattern,
    identifier,
    compileReplacementOptions
  )
}
