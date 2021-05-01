import j, { ASTPath, ASTNode, Collection } from 'jscodeshift'
import mapValues from 'lodash/mapValues'
import compileMatcher, {
  CompiledMatcher,
  MatchResult,
  mergeCaptures,
} from './compileMatcher'
import t from 'ast-types'

export type Match = {
  type: 'node' | 'nodes'
  path: ASTPath
  node: ASTNode
  paths: ASTPath[]
  nodes: ASTNode[]
  pathCaptures?: Record<string, ASTPath>
  captures?: Record<string, ASTNode>
  arrayPathCaptures?: Record<string, ASTPath[]>
  arrayCaptures?: Record<string, ASTNode[]>
  stringCaptures?: Record<string, string>
}

export type FindOptions = {
  where?: { [captureName: string]: (path: ASTPath) => boolean }
  withCaptures?: Match | Match[]
}

export function convertWithCaptures(matches: Match | Match[]): MatchResult {
  return mergeCaptures(
    ...(Array.isArray(matches) ? matches : [matches]).map(
      ({ pathCaptures, arrayPathCaptures, stringCaptures }): MatchResult => ({
        captures: pathCaptures,
        arrayCaptures: arrayPathCaptures,
        stringCaptures,
      })
    )
  )
}

export function createMatch(
  paths: ASTPath | ASTPath[],
  result: MatchResult
): Match {
  if (!result) {
    throw new Error('result must be defined')
  }
  const { captures, arrayCaptures, stringCaptures } = result
  const match: Match = Array.isArray(paths)
    ? {
        type: 'nodes',
        node: paths[0].node,
        path: paths[0],
        nodes: paths.map((p) => p.node),
        paths,
      }
    : {
        type: 'node',
        node: paths.node,
        path: paths,
        nodes: [paths.node],
        paths,
      }
  if (captures) {
    match.pathCaptures = captures
    match.captures = mapValues(captures, (path: ASTPath) => path.node)
  }
  if (arrayCaptures) {
    match.arrayPathCaptures = arrayCaptures
    match.arrayCaptures = mapValues(arrayCaptures, (paths: ASTPath[]) =>
      paths.map((path) => path.node)
    )
  }
  if (stringCaptures) match.stringCaptures = stringCaptures
  return match
}

export default function find(
  root: Collection,
  path: ASTPath | ASTPath[],
  options?: FindOptions
): Match[] {
  if (Array.isArray(path) && path.length === 1) path = path[0]
  if (Array.isArray(path) && t.namedTypes.Statement.check(path[0]?.node)) {
    return findStatements(root, path, options)
  }

  const matcher = compileMatcher(path, options)

  const matches: Array<Match> = []

  const nodeTypes = Array.isArray(matcher.nodeType)
    ? matcher.nodeType
    : matcher.nodeType
    ? [matcher.nodeType]
    : ['Node']

  const matchSoFar = options?.withCaptures
    ? convertWithCaptures(options.withCaptures)
    : null

  for (const nodeType of nodeTypes) {
    root.find(j[nodeType]).forEach((path: ASTPath) => {
      const result = matcher.match(path, matchSoFar)
      if (result) matches.push(createMatch(path, result))
    })
  }

  return matches
}

function findStatementArrayPaths(root: Collection): ASTPath[] {
  const result: ASTPath[] = []
  root.find(j.Statement).forEach((path: ASTPath) => {
    const { parentPath } = path
    if (Array.isArray(parentPath.value) && parentPath.value[0] === path.node)
      result.push(parentPath)
  })
  return result
}

function findStatements(
  root: Collection,
  paths: ASTPath[],
  options?: FindOptions
): Match[] {
  const matchers: CompiledMatcher[] = paths.map((queryElem) =>
    compileMatcher(queryElem, options)
  )

  const firstNonArrayCaptureIndex = matchers.findIndex((m) => !m.arrayCaptureAs)

  if (firstNonArrayCaptureIndex < 0) {
    throw new Error(
      `pattern would match every single array of statements, this is unsupported`
    )
  }

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
  ): [MatchResult, [number, number]] | null {
    if (arrayIndex === path.value.length || matcherIndex === matchers.length) {
      return remainingElements(matcherIndex) === 0
        ? [matchSoFar || {}, [arrayIndex, arrayIndex]]
        : null
    }

    const matcher = matchers[matcherIndex]
    const { arrayCaptureAs } = matcher
    if (arrayCaptureAs) {
      if (matcherIndex === matchers.length - 1) {
        return [
          mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [arrayCaptureAs]: slicePath(path, sliceStart),
            },
          }),
          [sliceStart, path.value.length],
        ]
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
      const end =
        prevArrayCaptureAs && matcherIndex !== firstNonArrayCaptureIndex
          ? path.value.length - remainingElements(matcherIndex + 1)
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
        if (restMatch) return [restMatch[0], [i, restMatch[1][1]]]
      }
    }
    return null
  }

  // reverse order.  Otherwise, statements in an outer array could get replaced
  // before those in an inner array (for example, a function in root scope might
  // get replaced before a match within the function body gets replaced)
  const statementArrayPaths: ASTPath = findStatementArrayPaths(root).reverse()

  const matches: Match[] = []

  for (const path of statementArrayPaths) {
    const end =
      path.value.length - remainingElements(firstNonArrayCaptureIndex + 1)
    let sliceStart = 0
    for (let arrayIndex = 0; arrayIndex < end; arrayIndex++) {
      const match = matchElem(
        path,
        sliceStart,
        arrayIndex,
        firstNonArrayCaptureIndex,
        null
      )
      if (match) {
        let result = match[0]
        const [start, end] = match[1]

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

        const paths = slicePath(path, start, end)

        const finalMatch: Match = {
          type: 'nodes',
          path: paths[0],
          node: paths[0].node,
          paths,
          nodes: paths.map((p) => p.node),
        }
        if (result?.captures) {
          finalMatch.pathCaptures = result.captures
          finalMatch.captures = mapValues(result.captures, (p) => p.node)
        }
        if (result?.arrayCaptures) {
          finalMatch.arrayPathCaptures = result.arrayCaptures
          finalMatch.arrayCaptures = mapValues(result.arrayCaptures, (paths) =>
            paths.map((p) => p.node)
          )
        }
        if (result?.stringCaptures) {
          finalMatch.stringCaptures = result.stringCaptures
        }

        matches.push(finalMatch)

        // prevent overlapping matches
        sliceStart = end
        arrayIndex = end - 1
      }
    }
  }
  return matches
}
