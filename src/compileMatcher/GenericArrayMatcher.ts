import { NodePath, Node } from '../types'
import CompilePathError from '../util/CompilePathError'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from '.'
import indentDebug from './indentDebug'

export default function compileGenericArrayMatcher(
  path: NodePath<Node, Node[]> | NodePath<Node, Node>[],
  compileOptions: CompileOptions,
  {
    skipElement = () => false,
  }: { skipElement?: (path: NodePath) => boolean } = {}
): CompiledMatcher {
  const paths = Array.isArray(path) ? path : path.filter(() => true)
  const pattern: Node[] = path.map((p: NodePath) => p.node)
  const { debug } = compileOptions
  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const matchers: CompiledMatcher[] = pattern.map((value, i) =>
    compileMatcher(paths[i], elemOptions)
  )

  const otherMatchers: CompiledMatcher[] = []
  let arrayMatcherCount = 0
  let restMatcher
  for (let i = 0; i < matchers.length; i++) {
    if (matchers[i].restCaptureAs) {
      if (restMatcher) {
        throw new CompilePathError(
          `can't have two or more rest matchers as siblings`,
          matchers[i].pattern as NodePath
        )
      } else if (arrayMatcherCount) {
        throw new CompilePathError(
          `can't mix array and rest matchers`,
          matchers[i].pattern as NodePath
        )
      } else {
        restMatcher = matchers[i]
      }
    } else if (matchers[i].arrayCaptureAs) {
      if (restMatcher) {
        throw new CompilePathError(
          `can't mix array and rest matchers`,
          matchers[i].pattern as NodePath
        )
      }
      arrayMatcherCount++
    } else {
      otherMatchers.push(matchers[i])
    }
  }

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (!matchers[i].arrayCaptureAs) count++
    }
    return count
  }

  if (restMatcher) {
    const { restCaptureAs } = restMatcher
    if (!restCaptureAs)
      throw new Error(`unexpected: restMatcher.restCaptureAs == null`)
    return {
      pattern: paths,
      match: (path: NodePath, result: MatchResult): MatchResult => {
        debug('Array')

        if (!Array.isArray(path.value)) return null

        const paths = (path as NodePath<Node, Node[]>).filter(() => true)

        for (const m of otherMatchers) {
          let i
          let found = false
          for (i = 0; i < paths.length; i++) {
            const match = m.match(paths[i], result)
            if (!match) continue
            result = match
            paths.splice(i, 1)
            found = true
            break
          }
          if (!found) {
            return null
          }
        }
        return mergeCaptures(result, {
          arrayCaptures: { [restCaptureAs]: paths },
        })
      },
    }
  }

  function matchElem(
    paths: NodePath[],
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
      pattern: paths,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        debug('Array')

        if (!Array.isArray(path.value)) return null
        const paths = (path as NodePath<Node, Node[]>).filter(() => true)

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
    pattern: paths,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('Array')

      if (!Array.isArray(path.value)) return null

      let m = 0,
        i = 0
      while (i < paths.length || m < matchers.length) {
        debug('  [%d]', i)
        const elemPath = path.get(i)
        if (skipElement(elemPath)) {
          i++
          continue
        }
        if (m >= matchers.length) return null
        matchSoFar = matchers[m].match(elemPath, matchSoFar)
        if (!matchSoFar) return null
        m++
        i++
      }
      return matchSoFar || {}
    },
  }
}
