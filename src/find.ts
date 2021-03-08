import j, { ASTPath, ASTNode, Collection, Statement } from 'jscodeshift'
import mapValues from 'lodash/mapValues'
import compileMatcher, {
  CompiledMatcher,
  MatchResult,
  mergeCaptures,
} from './compileMatcher'

export type Match<Node extends ASTNode> = {
  path: ASTPath<Node>
  node: Node
  pathCaptures?: Record<string, ASTPath<any>>
  captures?: Record<string, ASTNode>
  arrayPathCaptures?: Record<string, ASTPath<any>[]>
  arrayCaptures?: Record<string, ASTNode[]>
}

export type StatementsMatch = {
  paths: ASTPath<Statement>[]
  nodes: Statement[]
  pathCaptures?: Record<string, ASTPath<any>>
  captures?: Record<string, ASTNode>
  arrayPathCaptures?: Record<string, ASTPath<any>[]>
  arrayCaptures?: Record<string, ASTNode[]>
}

export type FindOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
}

export default function find<Node extends ASTNode>(
  root: Collection,
  query: Node,
  options?: FindOptions
): Array<Match<Node>>
export default function find(
  root: Collection,
  query: Statement[],
  options?: FindOptions
): Array<StatementsMatch>
export default function find<Node extends ASTNode>(
  root: Collection,
  query: Node | Statement[],
  options?: FindOptions
): Array<Match<Node>> | Array<StatementsMatch> {
  if (Array.isArray(query)) {
    return findStatements(root, query, options)
  }

  const matcher = compileMatcher(query, options)

  const matches: Array<Match<Node>> = []

  const nodeTypes = Array.isArray(matcher.nodeType)
    ? matcher.nodeType
    : matcher.nodeType
    ? [matcher.nodeType]
    : ['Node']

  for (const nodeType of nodeTypes) {
    root.find(j[nodeType]).forEach((path: ASTPath<any>) => {
      const result = matcher.match(path, null)
      if (result) {
        const match: Match<Node> = { path, node: path.node }
        const {
          captures: pathCaptures,
          arrayCaptures: arrayPathCaptures,
        } = result
        if (pathCaptures) {
          match.pathCaptures = pathCaptures
          match.captures = mapValues(
            pathCaptures,
            (path: ASTPath<any>) => path.node
          )
        }
        if (arrayPathCaptures) {
          match.arrayPathCaptures = arrayPathCaptures
          match.arrayCaptures = mapValues(
            arrayPathCaptures,
            (paths: ASTPath<any>[]) => paths.map((path) => path.node)
          )
        }
        matches.push(match)
      }
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
  query: Statement[],
  options?: FindOptions
): Array<StatementsMatch> {
  const matchers: CompiledMatcher[] = query.map((queryElem) =>
    compileMatcher(queryElem as any, options)
  )

  const firstNonArrayCaptureIndex = matchers.findIndex((m) => !m.arrayCaptureAs)

  if (firstNonArrayCaptureIndex < 0) {
    throw new Error(
      `query would match every single array of statements, this is unsupported`
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
  const paths: ASTPath = findStatementArrayPaths(root).reverse()

  const matches: StatementsMatch[] = []

  for (const path of paths) {
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

        const finalMatch: StatementsMatch = {
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

        matches.push(finalMatch)

        // prevent overlapping matches
        sliceStart = end
        arrayIndex = end - 1
      }
    }
  }
  return matches
}
