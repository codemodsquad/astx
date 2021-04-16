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
  node: ASTNode,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement<ASTNode[]> | void {
  const arrayCaptureAs = getArrayCaptureAs(identifier)
  if (arrayCaptureAs) {
    return {
      generate: (match: Match<any> | StatementsMatch): ASTNode[] => {
        return cloneDeep(match.arrayCaptures?.[arrayCaptureAs] || [node])
      },
    }
  }
}

export default function compileCaptureReplacement<
  Pattern extends ASTNode,
  Converted = Pattern
>(
  node: Pattern,
  identifier: string,
  compileReplacementOptions: CompileReplacementOptions,
  {
    convertCapture = (node) => node as any,
  }: { convertCapture?: (node: ASTNode) => Converted } = {}
): CompiledReplacement<Converted | Pattern | ASTNode[]> | void {
  const captureAs = getCaptureAs(identifier)
  if (captureAs) {
    return {
      generate: (match: Match<any> | StatementsMatch): Converted | Pattern => {
        const capture = match.captures?.[captureAs]
        return capture ? convertCapture(cloneDeep(capture)) : cloneDeep(node)
      },
    }
  }
  return compileArrayCaptureReplacement(
    node,
    identifier,
    compileReplacementOptions
  )
}
