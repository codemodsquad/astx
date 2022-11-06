import { NodePath, Node } from '../types'
import CompilePathError from '../util/CompilePathError'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from '.'
import indentDebug from './indentDebug'

const defaultUnorderedFields: { [k in string]?: { [k in string]?: true } } = {}
for (const [type, field] of [
  ['ClassBody', 'body'],
  ['ClassDeclaration', 'implements'],
  ['DeclareClass', 'implements'],
  ['DeclareExportDeclaration', 'specifiers'],
  ['DeclareInterface', 'extends'],
  ['EnumDeclaration', 'body'],
  ['ExportNamedDeclaration', 'specifiers'],
  ['ImportDeclaration', 'specifiers'],
  ['InterfaceDeclaration', 'extends'],
  ['IntersectionTypeAnnotation', 'types'],
  ['JSXOpeningElement', 'attributes'],
  ['ObjectExpression', 'properties'],
  ['ObjectPattern', 'properties'],
  ['ObjectTypeAnnotation', 'properties'],
  ['TSEnumDeclaration', 'members'],
  ['TSInterfaceBody', 'body'],
  ['TSInterfaceDeclaration', 'extends'],
  ['TSIntersectionType', 'types'],
  ['TSTypeLiteral', 'members'],
  ['TSUnionType', 'types'],
  ['UnionTypeAnnotation', 'types'],
]) {
  const forType =
    defaultUnorderedFields[type] || (defaultUnorderedFields[type] = {})
  forType[field] = true
}

function getDefaultUnordered(
  path: NodePath<Node, Node[]> | NodePath<Node, Node>[]
): boolean {
  if (Array.isArray(path)) {
    const parent = path[0]?.parentPath
    if (!parent) return false
    return getDefaultUnordered(parent)
  }
  if (!path.node || !path.name) return false
  return Boolean(defaultUnorderedFields[path.node.type]?.[path.name])
}

export default function compileGenericArrayMatcher(
  path: NodePath<Node, Node[]> | NodePath<Node, Node>[],
  compileOptions: CompileOptions,
  {
    compileElemMatcher = compileMatcher,
    defaultUnordered = getDefaultUnordered(path),
    skipElement = () => false,
  }: {
    compileElemMatcher?: (
      path: NodePath,
      options: CompileOptions
    ) => CompiledMatcher
    defaultUnordered?: boolean
    skipElement?: (path: NodePath) => boolean
  } = {}
): CompiledMatcher {
  const paths = Array.isArray(path) ? path : path.filter(() => true)
  const pattern: Node[] = path.map((p: NodePath) => p.node)
  const { debug } = compileOptions
  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  let matchers: CompiledMatcher[] = pattern.map((value, i) =>
    compileElemMatcher(paths[i], elemOptions)
  )

  assertArrayMatchersValid(matchers)

  const unordered =
    matchers.some((m) => m.restPlaceholder || m.placeholder === '$Unordered') ||
    (defaultUnordered &&
      !matchers.some((m) => m.placeholder === '$Ordered' || m.arrayPlaceholder))

  matchers = matchers.filter(
    (m) => m.placeholder !== '$Ordered' && m.placeholder !== '$Unordered'
  )

  if (unordered) {
    return compileUnorderedArrayMatcher(paths, compileOptions, {
      matchers,
    })
  }

  if (matchers.some((m) => m.placeholder || m.arrayPlaceholder)) {
    return compileOrderedArrayMatcher(paths, compileOptions, {
      matchers,
      skipElement,
    })
  }

  return compileExactArrayMatcher(paths, compileOptions, {
    matchers,
    skipElement,
  })
}

function assertArrayMatchersValid(matchers: CompiledMatcher[]) {
  const otherMatchers: CompiledMatcher[] = []
  let arrayMatcherCount = 0
  let restMatcher
  for (let i = 0; i < matchers.length; i++) {
    if (matchers[i].restPlaceholder) {
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
    } else if (matchers[i].arrayPlaceholder) {
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
}

function compileOrderedArrayMatcher(
  paths: NodePath<Node, Node>[],
  compileOptions: CompileOptions,
  {
    matchers,
    skipElement = () => false,
  }: {
    matchers: CompiledMatcher[]
    skipElement?: (path: NodePath) => boolean
  }
): CompiledMatcher {
  const { debug } = compileOptions

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (!matchers[i].arrayPlaceholder) count++
    }
    return count
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

    const { arrayPlaceholder } = matcher

    if (arrayPlaceholder) {
      if (matcherIndex === matchers.length - 1) {
        return mergeCaptures(matchSoFar, {
          arrayCaptures: {
            [arrayPlaceholder]: paths.slice(sliceStart),
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
      const prevArrayPlaceholder = matchers[matcherIndex - 1]?.arrayPlaceholder
      const end = prevArrayPlaceholder
        ? paths.length - remainingElements(matcherIndex + 1)
        : arrayIndex + 1

      for (let i = arrayIndex; i < end; i++) {
        const elemPath = paths[i]

        if (skipElement(elemPath)) continue

        matchSoFar = matcher.match(elemPath, origMatchSoFar)

        if (!matchSoFar) continue

        if (prevArrayPlaceholder) {
          matchSoFar = mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [prevArrayPlaceholder]: paths.slice(sliceStart, i),
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

  return {
    pattern: paths,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('Array (ordered)')

      if (!Array.isArray(path.value)) return null
      const paths = (path as NodePath<Node, Node[]>).filter(() => true)

      let result = matchElem(paths, 0, 0, 0, matchSoFar)
      if (!result) return result

      // make sure all * captures are present in results
      // (if there are more than one adjacent *, all captured paths will be in the
      // last one and the rest will be empty)
      for (const matcher of matchers) {
        const { arrayPlaceholder } = matcher
        if (!arrayPlaceholder) continue
        if (!result?.arrayCaptures?.[arrayPlaceholder])
          result = mergeCaptures(result, {
            arrayCaptures: { [arrayPlaceholder]: [] },
          })
      }
      return result
    },
  }
}

function compileUnorderedArrayMatcher(
  paths: NodePath<Node, Node>[],
  compileOptions: CompileOptions,
  {
    matchers,
    skipElement = () => false,
  }: {
    matchers: CompiledMatcher[]
    skipElement?: (path: NodePath) => boolean
  }
): CompiledMatcher {
  const { debug } = compileOptions

  const restMatcher = matchers.find((m) => m.restPlaceholder)
  matchers = matchers.filter((m) => !m.restPlaceholder)
  const restPlaceholder = restMatcher?.restPlaceholder

  return {
    pattern: paths,
    match: (path: NodePath, result: MatchResult): MatchResult => {
      debug('Array (unordered)')

      if (!Array.isArray(path.value)) return null

      const paths = (path as NodePath<Node, Node[]>).filter(() => true)

      for (const m of matchers) {
        let i
        let found = false
        for (i = 0; i < paths.length; i++) {
          if (skipElement(paths[i])) {
            i++
            continue
          }
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
      if (restPlaceholder) {
        return mergeCaptures(result, {
          arrayCaptures: { [restPlaceholder]: paths },
        })
      } else {
        if (paths.length) {
          return null
        }
        return result || {}
      }
    },
  }
}

function compileExactArrayMatcher(
  paths: NodePath<Node, Node>[],
  compileOptions: CompileOptions,
  {
    matchers,
    skipElement = () => false,
  }: {
    matchers: CompiledMatcher[]
    skipElement?: (path: NodePath) => boolean
  }
): CompiledMatcher {
  const { debug } = compileOptions
  return {
    pattern: paths,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('Array (exact)')

      if (!Array.isArray(path.value)) return null

      const paths = path.filter((p) => !skipElement(p))

      let m = 0,
        i = 0
      while (i < paths.length || m < matchers.length) {
        debug('  [%d]', i)
        if (i >= paths.length || m >= matchers.length) {
          debug('    length mismatch')
          return null
        }
        matchSoFar = matchers[m].match(paths[i], matchSoFar)
        if (!matchSoFar) return null
        m++
        i++
      }
      return matchSoFar || {}
    },
  }
}
