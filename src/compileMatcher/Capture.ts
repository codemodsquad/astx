import {
  CompileOptions,
  MatchResult,
  mergeCaptures,
  CompiledNodeMatcher,
} from '.'
import { Node, NodePath } from '../types'
import convertToJSXIdentifierName from '../convertReplacement/convertToJSXIdentifierName'
import { Backend } from '../backend/Backend'

export function unescapeIdentifier(identifier: string): string {
  return identifier.replace(/^\$_/, '$')
}

export function getCaptureAs(identifier: string): string | undefined {
  return /^\$[a-z0-9]+.*/i.exec(identifier)?.[0]
}

export function getArrayCaptureAs(identifier: string): string | undefined {
  return /^\${2}[a-z0-9]+.*/i.exec(identifier)?.[0]
}

export function getRestCaptureAs(identifier: string): string | undefined {
  return /^\${3}[a-z0-9]+.*/i.exec(identifier)?.[0]
}

export function getAnyCaptureAs(identifier: string): string | undefined {
  return /^\${1,3}[a-z0-9]+.*/i.exec(identifier)?.[0]
}

export function compileArrayCaptureMatcher(
  pattern: NodePath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileOptions: CompileOptions
): CompiledNodeMatcher | void {
  const arrayCaptureAs = getArrayCaptureAs(identifier)
  if (arrayCaptureAs) {
    return {
      type: 'node',
      pattern,
      arrayCaptureAs,
      match: (): MatchResult => {
        throw new Error(
          `array capture placeholder ${arrayCaptureAs} is in an invalid position`
        )
      },
    }
  }
}

export function compileRestCaptureMatcher(
  pattern: NodePath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileOptions: CompileOptions
): CompiledNodeMatcher | void {
  const restCaptureAs = getRestCaptureAs(identifier)
  if (restCaptureAs) {
    return {
      type: 'node',
      pattern,
      restCaptureAs,
      match: (): MatchResult => {
        throw new Error(
          `rest capture placeholder ${restCaptureAs} is in an invalid position`
        )
      },
    }
  }
}

export function capturesAreEquivalent(
  backend: Backend,
  a: Node,
  b: Node
): boolean {
  if (backend.areASTsEqual(a, b)) return true
  const aIdent = convertToJSXIdentifierName(a)
  const bIdent = convertToJSXIdentifierName(b)
  return aIdent ? aIdent === bIdent : false
}

export default function compileCaptureMatcher(
  pattern: NodePath,
  identifier: string,
  compileOptions: CompileOptions
): CompiledNodeMatcher | void {
  const { debug } = compileOptions
  const captureAs = getCaptureAs(identifier)
  if (captureAs) {
    const whereCondition = compileOptions?.where?.[captureAs]
    return {
      type: 'node',
      pattern,
      captureAs,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (path.node == null) return null
        debug('Capture', captureAs)
        const existingCapture = matchSoFar?.captures?.[captureAs]
        if (existingCapture) {
          return capturesAreEquivalent(
            compileOptions.backend,
            existingCapture.node,
            path.node
          )
            ? matchSoFar
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
  return (
    compileArrayCaptureMatcher(pattern, identifier, compileOptions) ||
    compileRestCaptureMatcher(pattern, identifier, compileOptions)
  )
}

export function compileStringCaptureMatcher<N extends Node>(
  pattern: NodePath<N>,
  getString: (node: N) => string | null,
  compileOptions: CompileOptions
): CompiledNodeMatcher | void {
  const { debug } = compileOptions
  const string = getString(pattern.node)
  if (!string) return
  const captureAs = getCaptureAs(string)
  if (captureAs) {
    return {
      type: 'node',
      pattern,
      captureAs,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (path.node?.type !== pattern.node.type) return null
        debug('String Capture', captureAs)
        const string = getString((path as NodePath<N>).node)
        if (!string) return null
        const existingCapture = matchSoFar?.stringCaptures?.[captureAs]
        if (existingCapture) {
          return string === existingCapture ? matchSoFar : null
        }
        debug('  captured as %s', captureAs)
        return mergeCaptures(matchSoFar, {
          stringCaptures: { [captureAs]: string },
        })
      },
    }
  }
}
