import { ASTPath, ASTNode } from '../variant'
import compileMatcher, {
  CompiledMatcher,
  CompiledArrayMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './'
import indentDebug from './indentDebug'

export default function compileGenericArrayMatcher(
  paths: ASTPath<any>[],
  compileOptions: CompileOptions,
  {
    skipElement = () => false,
  }: { skipElement?: (path: ASTPath) => boolean } = {}
): CompiledArrayMatcher {
  const pattern: ASTNode[] = paths.map((p: ASTPath) => p.node)
  const { debug } = compileOptions
  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const matchers: CompiledMatcher[] = pattern.map((value, i) =>
    compileMatcher(paths[i], elemOptions)
  )

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (!matchers[i].arrayCaptureAs) count++
    }
    return count
  }

  function matchElem(
    paths: ASTPath<any>[],
    sliceStart: number,
    arrayIndex: number,
    matcherIndex: number,
    matchSoFar: MatchResult
  ): MatchResult {
    while (arrayIndex < paths.length && skipElement(paths[arrayIndex]))
      arrayIndex++

    if (arrayIndex === paths.length) {
      return remainingElements(matcherIndex) === 0 ? matchSoFar || {} : null
    }

    if (matcherIndex === matchers.length) return null

    const matcher = matchers[matcherIndex]

    const { arrayCaptureAs } = matcher

    if (arrayCaptureAs) {
      if (matcherIndex === matchers.length - 1) {
        return mergeCaptures(matchSoFar, {
          arrayCaptures: {
            [arrayCaptureAs]: paths.slice(sliceStart),
          },
        })
      }

      return matchElem(
        paths,
        sliceStart,
        arrayIndex,
        matcherIndex + 1,
        matchSoFar
      )
    } else {
      const origMatchSoFar = matchSoFar
      const prevArrayCaptureAs = matchers[matcherIndex - 1]?.arrayCaptureAs
      const end = prevArrayCaptureAs
        ? paths.length - remainingElements(matcherIndex + 1)
        : arrayIndex + 1

      for (let i = arrayIndex; i < end; i++) {
        const elemPath = paths[i]

        if (skipElement(elemPath)) continue

        matchSoFar = matcher.match(elemPath, origMatchSoFar)

        if (!matchSoFar) continue

        if (prevArrayCaptureAs) {
          matchSoFar = mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [prevArrayCaptureAs]: paths.slice(sliceStart, i),
            },
          })
        }

        const restMatch = matchElem(
          paths,
          i + 1,
          i + 1,
          matcherIndex + 1,
          matchSoFar
        )

        if (restMatch) return restMatch
      }
    }

    return null
  }

  if (matchers.some((m) => m.captureAs || m.arrayCaptureAs)) {
    return {
      match: (paths: ASTPath<any>[], matchSoFar: MatchResult): MatchResult => {
        debug('Array')
        if (!Array.isArray(paths)) {
          debug('  paths is not an array')
          return null
        }

        let result = matchElem(paths, 0, 0, 0, matchSoFar)
        if (!result) return result

        // make sure all * captures are present in results
        // (if there are more than one adjacent *, all captured paths will be in the
        // last one and the rest will be empty)
        for (const matcher of matchers) {
          const { arrayCaptureAs } = matcher
          if (!arrayCaptureAs) continue
          if (!result?.arrayCaptures?.[arrayCaptureAs])
            result = mergeCaptures(result, {
              arrayCaptures: { [arrayCaptureAs]: [] },
            })
        }
        return result
      },
    }
  }

  return {
    match: (paths: ASTPath<any>[], matchSoFar: MatchResult): MatchResult => {
      debug('Array')
      if (!Array.isArray(paths)) {
        debug('  paths is not an array')
        return null
      }
      let m = 0,
        i = 0
      while (i < paths.length || m < matchers.length) {
        debug('  [%d]', i)
        const elemPath = paths[i]
        if (skipElement(elemPath)) {
          i++
          continue
        }
        if (m >= matchers.length || i >= paths.length) return null
        matchSoFar = matchers[m].match(elemPath, matchSoFar)
        if (!matchSoFar) return null
        m++
        i++
      }
      return matchSoFar || {}
    },
  }
}
