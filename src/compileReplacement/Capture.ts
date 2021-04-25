import { CompileReplacementOptions, CompiledReplacement } from './'
import { ASTNode } from 'jscodeshift'
import { StatementsMatch, Match } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import {
  getArrayCaptureAs,
  getCaptureAs,
  unescapeIdentifier,
} from '../compileMatcher/Capture'

export { unescapeIdentifier }

export function compileArrayCaptureReplacement(
  pattern: ASTNode,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions,
  {
    convertCapture = (capture) => capture as any,
  }: { convertCapture?: (capture: ASTNode) => ASTNode | ASTNode[] } = {}
): CompiledReplacement | void {
  const arrayCaptureAs = getArrayCaptureAs(identifier)
  if (arrayCaptureAs) {
    return {
      generate: (match: Match | StatementsMatch): ASTNode | ASTNode[] => {
        const captures = match.arrayCaptures?.[arrayCaptureAs]
        if (captures) {
          const result: ASTNode[] = []
          for (const capture of captures) {
            const converted = convertCapture(cloneDeep(capture))
            if (Array.isArray(converted))
              converted.forEach((c) => result.push(c))
            else result.push(converted)
          }
          return result
        }
        return [cloneDeep(pattern)]
      },
    }
  }
}

export default function compileCaptureReplacement(
  pattern: ASTNode,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions,
  {
    convertCapture = (capture) => capture as any,
  }: { convertCapture?: (capture: ASTNode) => ASTNode | ASTNode[] } = {}
): CompiledReplacement | void {
  const captureAs = getCaptureAs(identifier)
  if (captureAs) {
    return {
      generate: (match: Match | StatementsMatch): ASTNode | ASTNode[] => {
        const capture = match.captures?.[captureAs]
        if (capture) {
          const clone = cloneDeep(capture)
          if ((capture as any).astx?.excludeTypeAnnotationFromCapture)
            delete (clone as any).typeAnnotation
          return convertCapture(clone)
        }
        return cloneDeep(pattern)
      },
    }
  }
  return compileArrayCaptureReplacement(
    pattern,
    identifier,
    compileReplacementOptions,
    { convertCapture }
  )
}
