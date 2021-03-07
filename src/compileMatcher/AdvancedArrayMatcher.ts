import { ASTNode, ASTPath } from 'jscodeshift'
import areASTsEqual from '../util/areASTsEqual'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './'
import indentDebug from './indentDebug'

export type ElementMatcherKind =
  /**
   * Captures multiple array elements
   */
  | { kind: '*'; captureAs: string }
  /**
   * Captures a single array element
   */
  | { kind: '$'; captureAs: string }
  /**
   * Matches array element against the given query
   */
  | { kind: 'element'; query: ASTNode }

type ElementMatcher =
  | { kind: '*'; captureAs: string }
  | { kind: '$'; captureAs: string }
  | { kind: 'element'; matcher: CompiledMatcher }

type CompileArrayMatcherOptions = {
  getElementMatcherKind: (elem: ASTNode) => ElementMatcherKind
}

function getCaptureAs(matcher: ElementMatcher | undefined): string | undefined {
  return matcher?.kind === '*' ? matcher.captureAs : undefined
}

export default function compileArrayMatcher(
  query: ASTNode[],
  compileOptions: CompileOptions,
  { getElementMatcherKind }: CompileArrayMatcherOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const matchers: ElementMatcher[] = query.map((queryElem: ASTNode) => {
    const matcherKind = getElementMatcherKind(queryElem)
    if (matcherKind.kind === 'element')
      return {
        kind: 'element',
        matcher: compileMatcher(queryElem, {
          ...compileOptions,
          debug: indentDebug(debug, 2),
        }),
      }
    return matcherKind
  })

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (matchers[i].kind !== '*') count++
    }
    return count
  }

  function slicePath(
    path: ASTPath,
    start: number,
    end: number = path.value.length
  ): ASTPath[] {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(path.get(i))
    }
    return result
  }

  function matchElem(
    path: ASTPath,
    sliceStart: number,
    arrayIndex: number,
    matcherIndex: number,
    matchSoFar: MatchResult
  ): MatchResult {
    if (arrayIndex === path.value.length)
      return remainingElements(matcherIndex) === 0 ? matchSoFar || {} : null

    const matcher = matchers[matcherIndex]
    switch (matcher.kind) {
      case '*':
        if (matcherIndex === matchers.length - 1) {
          const { captureAs } = matcher
          return mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [captureAs]: slicePath(path, sliceStart),
            },
          })
        }
        return matchElem(
          path,
          sliceStart,
          arrayIndex,
          matcherIndex + 1,
          matchSoFar
        )
      case '$':
      case 'element': {
        const origMatchSoFar = matchSoFar
        const capturePreceedingAs = getCaptureAs(matchers[matcherIndex - 1])
        const end = capturePreceedingAs
          ? path.value.length - remainingElements(matcherIndex + 1)
          : arrayIndex + 1
        for (let i = arrayIndex; i < end; i++) {
          matchSoFar = origMatchSoFar
          if (matcher.kind === '$') {
            const { captureAs } = matcher
            const priorCapture = matchSoFar?.captures?.[captureAs]
            if (priorCapture) {
              if (!areASTsEqual(priorCapture.node, path.get(i).node)) continue
            } else {
              matchSoFar = mergeCaptures(matchSoFar, {
                captures: { [captureAs]: path.get(i) },
              })
            }
          } else {
            matchSoFar = matcher.matcher.match(path.get(i), matchSoFar)
          }
          if (!matchSoFar) continue
          if (capturePreceedingAs) {
            matchSoFar = mergeCaptures(matchSoFar, {
              arrayCaptures: {
                [capturePreceedingAs]: slicePath(path, sliceStart, i),
              },
            })
          }
          const restMatch = matchElem(
            path,
            i + 1,
            i + 1,
            matcherIndex + 1,
            matchSoFar
          )
          if (!restMatch) continue
          return restMatch
        }
      }
    }
    return null
  }

  return {
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      debug('Array')
      if (!Array.isArray(path.value)) {
        debug('  path.value is not an array')
        return null
      }
      // if (path.value.length !== query.length) {
      //   debug(
      //     '  path.value.length (%d) !== query.length (%d)',
      //     path.value.length,
      //     query.length
      //   )
      //   return null
      // }
      // for (let i = 0; i < elemMatchers.length; i++) {
      //   debug('  [%d]', i)
      //   const result = elemMatchers[i].match(path.get(i), matchSoFar)
      //   if (!result) return null
      //   captures = mergeCaptures(captures, result)
      //   matchSoFar = mergeCaptures(matchSoFar, result)
      // }
      // return captures || {}
      let result = matchElem(path, 0, 0, 0, matchSoFar)
      if (!result) return result

      // make sure all * captures are present in results
      // (if there are more than one adjacent *, all captured paths will be in the
      // last one and the rest will be empty)
      for (const matcher of matchers) {
        if (matcher.kind !== '*') continue
        if (!result?.arrayCaptures?.[matcher.captureAs])
          result = mergeCaptures(result, {
            arrayCaptures: { [matcher.captureAs]: [] },
          })
      }
      return result
    },
  }
}
