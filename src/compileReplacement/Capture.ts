import { CompileReplacementOptions, CompiledReplacement } from './'
import { ASTNode, ASTPath } from 'jscodeshift'
import { StatementsMatch, Match } from '../find'
import cloneDeep from 'lodash/cloneDeep'
import {
  getArrayCaptureAs,
  getCaptureAs,
  unescapeIdentifier,
} from '../compileMatcher/Capture'

export { unescapeIdentifier }

export function compileArrayCaptureReplacement<Converted>(
  pattern: ASTNode,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileReplacementOptions: CompileReplacementOptions,
  {
    convertCapture = (capture) => capture as any,
  }: { convertCapture?: (capture: ASTNode) => Converted | Converted[] } = {}
): CompiledReplacement<Converted[] | ASTNode[]> | void {
  const arrayCaptureAs = getArrayCaptureAs(identifier)
  if (arrayCaptureAs) {
    return {
      generate: (
        match: Match<any> | StatementsMatch
      ): Converted[] | ASTNode[] => {
        const captures = match.arrayCaptures?.[arrayCaptureAs]
        if (captures) {
          const result: Converted[] = []
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

export default function compileCaptureReplacement<
  Pattern extends ASTNode,
  Converted = Pattern
>(
  pattern: Pattern,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions,
  {
    convertCapture = (capture) => capture as any,
  }: { convertCapture?: (capture: ASTNode) => Converted | Converted[] } = {}
): CompiledReplacement<Converted | Pattern | Converted[] | ASTNode[]> | void {
  const captureAs = getCaptureAs(identifier)
  if (captureAs) {
    return {
      generate: (
        match: Match<any> | StatementsMatch
      ): Converted | Pattern | Converted[] => {
        const capture = match.captures?.[captureAs]
        return capture ? convertCapture(cloneDeep(capture)) : cloneDeep(pattern)
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
