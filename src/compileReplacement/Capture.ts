import { CompileReplacementOptions, CompiledReplacement } from './'
import { ASTNode, ASTPath } from 'jscodeshift'
import { Match } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import {
  getArrayCaptureAs,
  getCaptureAs,
  unescapeIdentifier,
} from '../compileMatcher/Capture'
import createReplacementConverter, { bulkConvert } from '../convertReplacement'
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
              captures.map((c) => cloneDeep(c)),
              convertReplacement
            ),
          ]
        }
        return [...bulkConvert(cloneDeep(pattern.node), convertReplacement)]
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
          const clone = cloneDeep(capture)
          if ((capture as any).astx?.excludeTypeAnnotationFromCapture)
            delete (clone as any).typeAnnotation
          return convertReplacement(clone)
        }
        return convertReplacement(cloneDeep(pattern.node))
      },
    }
  }
  return compileArrayCaptureReplacement(
    pattern,
    identifier,
    compileReplacementOptions
  )
}
