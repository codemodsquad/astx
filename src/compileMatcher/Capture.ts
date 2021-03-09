import { CompileOptions, MatchResult, mergeCaptures, CompiledMatcher } from './'
import { ASTPath } from 'jscodeshift'
import areASTsEqual from '../util/areASTsEqual'

export const unescapeIdentifier = (identifier: string): string =>
  identifier.replace(/^\$\$/, '$')

export function compileArrayCaptureMatcher(
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const arrayCaptureAs = /^\$_[a-z0-9]+/i.exec(identifier)?.[0]
  if (arrayCaptureAs) {
    return {
      arrayCaptureAs,
      match: (): MatchResult => {
        throw new Error(
          `array capture placeholder ${arrayCaptureAs} is in an invalid position`
        )
      },
    }
  }
}

export default function compileCaptureMatcher(
  identifier: string,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const captureAs = /^\$[a-z0-9]+/i.exec(identifier)?.[0]
  if (captureAs) {
    const whereCondition = compileOptions?.where?.[captureAs]
    return {
      captureAs,
      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        debug('Capture', identifier)
        const existingCapture = matchSoFar?.captures?.[captureAs]
        if (existingCapture) {
          return areASTsEqual(existingCapture.node, path.node)
            ? matchSoFar || {}
            : null
        }
        if (whereCondition && !whereCondition(path)) {
          debug('  where condition returned false')
          return null
        }
        debug('  captured as %s', captureAs)
        return mergeCaptures(matchSoFar, { captures: { [captureAs]: path } })
      },
    }
  }
  return compileArrayCaptureMatcher(identifier, compileOptions)
}
