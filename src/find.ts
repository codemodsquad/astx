import { NodeType, NodePath, Node, Statement, Block } from './types'
import mapValues from 'lodash/mapValues'
import compileMatcher, {
  CompiledNodeMatcher,
  MatchResult,
  mergeCaptures,
} from './compileMatcher'
import { Backend } from './Backend'

export type Match = {
  type: 'node' | 'nodes'
  path: NodePath
  node: Node
  paths: NodePath[]
  nodes: Node[]
  pathCaptures?: Record<string, NodePath>
  captures?: Record<string, Node>
  arrayPathCaptures?: Record<string, NodePath[]>
  arrayCaptures?: Record<string, Node[]>
  stringCaptures?: Record<string, string>
}

export type FindOptions = {
  backend: Backend
  where?: { [captureName: string]: (path: NodePath) => boolean }
  matchSoFar?: MatchResult
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
  paths: NodePath | NodePath[],
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
        paths: [paths],
      }
  if (captures) {
    match.pathCaptures = captures
    match.captures = mapValues(captures, (path: NodePath) => path.node)
  }
  if (arrayCaptures) {
    match.arrayPathCaptures = arrayCaptures
    match.arrayCaptures = mapValues(arrayCaptures, (paths: NodePath[]) =>
      paths.map((path) => path.node)
    )
  }
  if (stringCaptures) match.stringCaptures = stringCaptures
  return match
}

export default function find(
  root: NodePath,
  pattern: NodePath | NodePath[],
  options: FindOptions
): Match[] {
  const {
    backend: { isStatement, forEachNode },
  } = options
  if (Array.isArray(pattern) && pattern.length === 1) pattern = pattern[0]
  if (Array.isArray(pattern)) {
    if (!isStatement(pattern[0].node)) {
      throw new Error(`pattern array must be an array of statements`)
    }
    return findStatements(root, pattern as NodePath<Statement>[], options)
  }

  const matcher = compileMatcher(pattern, options)

  const matches: Array<Match> = []

  const nodeTypes: NodeType[] = Array.isArray(matcher.nodeType)
    ? matcher.nodeType
    : matcher.nodeType
    ? [matcher.nodeType]
    : ['Node']

  forEachNode([root], nodeTypes, (path: NodePath) => {
    const result = matcher.match(path, options?.matchSoFar ?? null)
    if (result) matches.push(createMatch(path, result))
  })

  return matches
}

function findStatements(
  root: NodePath,
  pattern: NodePath<Statement>[],
  options: FindOptions
): Match[] {
  const {
    backend: { forEachNode },
  } = options
  const matchers: CompiledNodeMatcher[] = pattern.map((queryElem) =>
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

  function matchElem(
    paths: NodePath<Statement>[],
    sliceStart: number,
    arrayIndex: number,
    matcherIndex: number,
    matchSoFar: MatchResult
  ): [MatchResult, [number, number]] | null {
    if (arrayIndex === paths.length || matcherIndex === matchers.length) {
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
              [arrayCaptureAs]: paths.slice(sliceStart),
            },
          }),
          [sliceStart, paths.length],
        ]
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
      const end =
        prevArrayCaptureAs && matcherIndex !== firstNonArrayCaptureIndex
          ? paths.length - remainingElements(matcherIndex + 1)
          : arrayIndex + 1
      for (let i = arrayIndex; i < end; i++) {
        matchSoFar = matcher.match(paths[i], origMatchSoFar)
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
        if (restMatch) return [restMatch[0], [i, restMatch[1][1]]]
      }
    }
    return null
  }

  const blocks: NodePath<Block>[] = []

  forEachNode([root], ['Block'], (path: NodePath) => {
    blocks.push(path as any)
  })
  blocks.reverse()

  const matches: Match[] = []

  const initialMatch = options?.matchSoFar ?? null

  for (const block of blocks) {
    const body: NodePath<Statement>[] = block.get('body') as any
    const end = body.length - remainingElements(firstNonArrayCaptureIndex + 1)
    let sliceStart = 0
    for (let arrayIndex = 0; arrayIndex < end; arrayIndex++) {
      const match = matchElem(
        body,
        sliceStart,
        arrayIndex,
        firstNonArrayCaptureIndex,
        initialMatch
      )
      if (match) {
        let result = match[0]
        const start = firstNonArrayCaptureIndex > 0 ? 0 : match[1][0]
        const [, end] = match[1]

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

        const paths = body.slice(start, end)

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
