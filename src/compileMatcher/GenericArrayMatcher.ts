import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './'
import indentDebug from './indentDebug'

export default function compileGenericArrayMatcher(
  query: ASTNode[],
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const matchers: CompiledMatcher[] = query.map((queryElem) =>
    compileMatcher(queryElem, {
      ...compileOptions,
      debug: indentDebug(debug, 2),
    })
  )

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (!matchers[i].arrayCaptureAs) count++
    }
    return count
  }

  function slicePath(
    path: ASTPath,
    start: number,
    end: number = (path.value as any).length
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
    if (arrayIndex === (path.value as any).length) {
      return remainingElements(matcherIndex) === 0 ? matchSoFar || {} : null
    }
    if (matcherIndex === matchers.length) return null

    const matcher = matchers[matcherIndex]
    const { arrayCaptureAs } = matcher
    if (arrayCaptureAs) {
      if (matcherIndex === matchers.length - 1) {
        return mergeCaptures(matchSoFar, {
          arrayCaptures: {
            [arrayCaptureAs]: slicePath(path, sliceStart),
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
    } else {
      const origMatchSoFar = matchSoFar
      const prevArrayCaptureAs = matchers[matcherIndex - 1]?.arrayCaptureAs
      const end = prevArrayCaptureAs
        ? (path.value as any).length - remainingElements(matcherIndex + 1)
        : arrayIndex + 1
      for (let i = arrayIndex; i < end; i++) {
        matchSoFar = matcher.match(path.get(i), origMatchSoFar)
        if (!matchSoFar) continue
        if (prevArrayCaptureAs) {
          matchSoFar = mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [prevArrayCaptureAs]: slicePath(path, sliceStart, i),
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
        if (restMatch) return restMatch
      }
    }
    return null
  }

  if (matchers.some((m) => m.captureAs || m.arrayCaptureAs)) {
    return {
      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        debug('Array')
        if (!Array.isArray(path.value)) {
          debug('  path.value is not an array')
          return null
        }

        let result = matchElem(path, 0, 0, 0, matchSoFar)
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
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      debug('Array')
      if (!Array.isArray(path.value)) {
        debug('  path.value is not an array')
        return null
      }
      if (path.value.length !== query.length) {
        debug(
          '  path.value.length (%d) !== query.length (%d)',
          path.value.length,
          query.length
        )
        return null
      }
      for (let i = 0; i < matchers.length; i++) {
        debug('  [%d]', i)
        matchSoFar = matchers[i].match(path.get(i), matchSoFar)
        if (!matchSoFar) return null
      }
      return matchSoFar || {}
    },
  }
}
