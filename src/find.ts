import { NodeType, NodePath, Node, Statement, Block } from './types'
import lodash from 'lodash'
const { mapValues } = lodash
import compileMatcher, {
  CompiledMatcher,
  MatchResult,
  mergeCaptures,
} from './compileMatcher'
import { Backend } from './backend/Backend'
import ensureArray from './util/ensureArray'
import forEachNode from './util/forEachNode'

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
    ...ensureArray(matches).map(
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
        node: paths[0]?.node,
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
  paths: NodePath | readonly NodePath[],
  pattern: NodePath | readonly NodePath[],
  options: FindOptions
): Match[] {
  const t = options.backend.t
  const n = t.namedTypes
  if (Array.isArray(pattern) && pattern.length === 1) pattern = pattern[0]
  if (Array.isArray(pattern)) {
    if (!n.Statement.check(pattern[0].value)) {
      throw new Error(`pattern array must be an array of statements`)
    }
    return findStatements(
      paths,
      pattern as NodePath<Statement, Statement>[],
      options
    )
  }

  const matcher = compileMatcher(pattern as NodePath, options)

  const matches: Array<Match> = []

  const nodeTypes: readonly NodeType[] = ensureArray(matcher.nodeType || 'Node')

  forEachNode(t, ensureArray(paths), nodeTypes, (path: NodePath) => {
    const result = matcher.match(path, options?.matchSoFar ?? null)
    if (result) matches.push(createMatch(path, result))
  })

  return matches
}

function findStatements(
  paths: NodePath | readonly NodePath[],
  pattern: readonly NodePath<Statement, Statement>[],
  options: FindOptions
): Match[] {
  const t = options.backend.t

  const matchers: CompiledMatcher[] = pattern.map((queryElem) =>
    compileMatcher(queryElem, options)
  )

  const firstNonArrayCaptureIndex = matchers.findIndex(
    (m) => !m.arrayPlaceholder
  )

  if (firstNonArrayCaptureIndex < 0) {
    throw new Error(
      `pattern would match every single array of statements, this is unsupported`
    )
  }

  function remainingElements(matcherIndex: number): number {
    let count = 0
    for (let i = matcherIndex; i < matchers.length; i++) {
      if (!matchers[i].arrayPlaceholder) count++
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
    const { arrayPlaceholder } = matcher
    if (arrayPlaceholder) {
      if (matcherIndex === matchers.length - 1) {
        return [
          mergeCaptures(matchSoFar, {
            arrayCaptures: {
              [arrayPlaceholder]: paths.slice(sliceStart),
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
      const prevArrayPlaceholder = matchers[matcherIndex - 1]?.arrayPlaceholder
      const end =
        prevArrayPlaceholder && matcherIndex !== firstNonArrayCaptureIndex
          ? paths.length - remainingElements(matcherIndex + 1)
          : arrayIndex + 1
      for (let i = arrayIndex; i < end; i++) {
        matchSoFar = matcher.match(paths[i], origMatchSoFar)
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
        if (restMatch) return [restMatch[0], [i, restMatch[1][1]]]
      }
    }
    return null
  }

  const blocks: NodePath<Block>[] = []

  forEachNode(t, ensureArray(paths), ['Block'], (path: NodePath) => {
    blocks.push(path as NodePath<Block>)
  })
  blocks.reverse()

  const matches: Match[] = []

  const initialMatch = options?.matchSoFar ?? null

  for (const block of blocks) {
    const body: NodePath<Statement>[] = block.get('body').filter(() => true)
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
          const { arrayPlaceholder } = matcher
          if (!arrayPlaceholder) continue
          if (!result?.arrayCaptures?.[arrayPlaceholder])
            result = mergeCaptures(result, {
              arrayCaptures: { [arrayPlaceholder]: [] },
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
