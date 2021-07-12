import { CompileOptions, MatchResult, mergeCaptures, CompiledMatcher } from './'
import { ASTNode, ASTPath } from 'jscodeshift'
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
        debug('Capture', captureAs)
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

export function compileStringCaptureMatcher<Node extends ASTNode>(
  query: Node,
  getString: (node: Node) => string | null,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const string = getString(query)
  if (!string) return
  const captureAs = /^\$[a-z0-9]+/i.exec(string)?.[0]
  if (captureAs) {
    return {
      captureAs,
      match: (path: ASTPath<Node>, matchSoFar: MatchResult): MatchResult => {
        if (path.node.type !== query.type) return null
        debug('String Capture', captureAs)
        const string = getString(path.node)
        if (!string) return null
        const existingCapture = matchSoFar?.stringCaptures?.[captureAs]
        if (existingCapture) {
          return string === existingCapture ? matchSoFar || {} : null
        }
        debug('  captured as %s', captureAs)
        return mergeCaptures(matchSoFar, {
          stringCaptures: { [captureAs]: string },
        })
      },
    }
  }
}
