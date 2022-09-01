import { Node, NodePath } from './types'
import { Backend } from './backend/Backend'
import find, { Match, convertWithCaptures, createMatch } from './find'
import replace from './replace'
import compileMatcher, { MatchResult } from './compileMatcher'
import CodeFrameError from './util/CodeFrameError'
import ensureArray from './util/ensureArray'
import { once } from 'lodash'

export type ParsePattern = (
  strings: string | string[] | TemplateStringsArray,
  ...quasis: any[]
) => Node | Node[]

export type GetReplacement = (
  match: Match,
  parse: ParsePattern
) => string | Node | Node[]

function isNode(x: unknown): x is Node {
  return x instanceof Object && typeof (x as any).type === 'string'
}
function isNodeArray(x: unknown): x is Node[] {
  return Array.isArray(x) && !Array.isArray((x as any).raw)
}

export type FindOptions = {
  where?: { [captureName: string]: (path: NodePath) => boolean }
}

export default class Astx {
  private readonly backend: Backend
  private readonly _paths: NodePath<any>[]
  private readonly _matches: Match[]
  private readonly _withCaptures: Match[]

  constructor(
    backend: Backend,
    paths: NodePath<any>[] | Match[],
    { withCaptures = [] }: { withCaptures?: Match[] } = {}
  ) {
    this.backend = backend
    const { NodePath } = backend.t
    this._paths =
      paths[0] instanceof NodePath
        ? (paths as NodePath[])
        : (paths as Match[]).map((m) => m.paths).flat()
    this._matches =
      paths[0] instanceof NodePath
        ? (paths as NodePath[]).map((path) => ({
            type: 'node',
            path,
            node: path.node,
            paths: [path],
            nodes: [path.node],
          }))
        : (paths as Match[])
    this._withCaptures = withCaptures
  }

  size(): number {
    return this._matches.length
  }

  get length(): number {
    return this._matches.length
  }

  matches(): Match[] {
    return this._matches
  }

  match(): Match {
    const [match] = this._matches
    if (!match) {
      throw new Error(`you can't call match() when there are no matches`)
    }
    return match
  }

  paths(): NodePath[] {
    return this._paths
  }

  nodes: () => Node[] = once((): Node[] => this._paths.map((p) => p.node))

  filter(
    iteratee: (match: Match, index: number, matches: Match[]) => boolean
  ): Astx {
    return new Astx(this.backend, this._matches.filter(iteratee))
  }

  at(index: number): Astx {
    return new Astx(this.backend, [this._matches[index]])
  }

  on(root: NodePath<any> | NodePath<any>[] | Match | Match[]): Astx {
    return new Astx(this.backend, ensureArray(root) as NodePath[] | Match[])
  }

  withCaptures(
    matches: Match | Astx | Match[] | Astx[] | (Match | Astx)[]
  ): Astx {
    const withCaptures: Match[] = [...this._withCaptures]
    if (Array.isArray(matches)) {
      for (const elem of matches) {
        if (elem instanceof Astx) withCaptures.push(...elem._matches)
        else withCaptures.push(elem)
      }
    } else if (matches instanceof Astx) {
      withCaptures.push(...matches._matches)
    } else {
      withCaptures.push(matches)
    }
    return new Astx(this.backend, this._matches, {
      withCaptures,
    })
  }

  captures(name: string): Astx {
    const matches: Match[] = []
    for (const match of this._matches) {
      const capture = match.pathCaptures?.[name]
      if (capture) matches.push(createMatch(capture, {}))
    }
    return new Astx(this.backend, matches)
  }

  captureNode(name: string): Node | null {
    for (const match of this._matches) {
      const capture = match.captures?.[name]
      if (capture) return capture
    }
    return null
  }

  capturePath(name: string): NodePath | null {
    for (const match of this._matches) {
      const capture = match.pathCaptures?.[name]
      if (capture) return capture
    }
    return null
  }

  arrayCaptures(name: string): Astx {
    const matches: Match[] = []
    for (const match of this._matches) {
      const capture = match.arrayPathCaptures?.[name]
      if (capture) matches.push(createMatch(capture, {}))
    }
    return new Astx(this.backend, matches)
  }

  arrayCaptureNodes(name: string): Node[] | null {
    for (const match of this._matches) {
      const capture = match.arrayCaptures?.[name]
      if (capture) return capture
    }
    return null
  }

  arrayCapturePaths(name: string): NodePath[] | null {
    for (const match of this._matches) {
      const capture = match.arrayPathCaptures?.[name]
      if (capture) return capture
    }
    return null
  }

  stringCapture(name: string): string | null {
    for (const match of this._matches) {
      const capture = match.stringCaptures?.[name]
      if (capture != null) return capture
    }
    return null
  }

  private _createInitialMatch(): MatchResult {
    return convertWithCaptures([...this._matches, ...this._withCaptures])
  }

  closest(
    strings: TemplateStringsArray,
    ...quasis: any[]
  ): (options?: FindOptions) => Astx
  closest(
    pattern: string | Node | Node[] | NodePath<any> | NodePath<any>[],
    options?: FindOptions
  ): Astx
  closest(
    arg0:
      | string
      | Node
      | Node[]
      | NodePath<any>
      | NodePath<any>[]
      | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    const { backend } = this
    const { parsePattern } = backend
    const { NodePath } = backend.t
    try {
      let paths: NodePath<any>[], options: FindOptions | undefined
      if (typeof arg0 === 'string') {
        paths = ensureArray(parsePattern(arg0))
        options = rest[0]
      } else if (
        Array.isArray(arg0)
          ? arg0[0] instanceof NodePath
          : arg0 instanceof NodePath
      ) {
        paths = ensureArray(arg0 as NodePath | NodePath[])
        options = rest[0]
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        paths = ensureArray(arg0).map((node) => new NodePath(node))
        options = rest[0]
      } else {
        const finalPaths = parsePattern(arg0 as any, ...rest)
        return (options?: FindOptions) =>
          this.closest(finalPaths, options) as any
      }
      if (paths.length !== 1) {
        throw new Error(`must be a single node`)
      }
      const matcher = compileMatcher(paths[0], {
        ...options,
        backend,
      })
      const matchSoFar = this._createInitialMatch()

      const matchedParents: Set<NodePath> = new Set()
      const matches: Match[] = []
      this._paths.forEach((path) => {
        for (let p = path.parentPath; p; p = p.parentPath) {
          if (matchedParents.has(p)) return
          const match = matcher.match(p, matchSoFar)
          if (match) {
            matchedParents.add(p)
            matches.push(createMatch(p, match))
            return
          }
        }
      })

      return new Astx(backend, matches)
    } catch (error) {
      if (error instanceof Error) {
        CodeFrameError.rethrow(error, {
          filename: 'find pattern',
          source: typeof arg0 === 'string' ? arg0 : undefined,
        })
      }
      throw error
    }
  }

  find(
    strings: string[] | TemplateStringsArray,
    ...quasis: any[]
  ): (options?: FindOptions) => Astx
  find(
    pattern: string | Node | Node[] | NodePath<any> | NodePath<any>[],
    options?: FindOptions
  ): Astx
  find(
    arg0:
      | string
      | Node
      | Node[]
      | NodePath<any>
      | NodePath<any>[]
      | string[]
      | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    const { backend } = this
    const { parsePattern } = backend
    const { NodePath } = backend.t
    try {
      let pattern, options: FindOptions | undefined
      if (typeof arg0 === 'string') {
        pattern = parsePattern(arg0)
        options = rest[0]
      } else if (
        Array.isArray(arg0)
          ? arg0[0] instanceof NodePath
          : arg0 instanceof NodePath
      ) {
        pattern = ensureArray(arg0 as NodePath | NodePath[])
        options = rest[0]
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        pattern = ensureArray(arg0).map((node) => new NodePath(node))
        options = rest[0]
      } else {
        const finalPaths = parsePattern(arg0 as any, ...rest)
        return (options?: FindOptions) => this.find(finalPaths, options) as any
      }
      return new Astx(
        backend,
        find(this._paths, pattern, {
          ...options,
          backend,
          matchSoFar: this._createInitialMatch(),
        })
      )
    } catch (error) {
      if (error instanceof Error) {
        CodeFrameError.rethrow(error, {
          filename: 'find pattern',
          source: typeof arg0 === 'string' ? arg0 : undefined,
        })
      }
      throw error
    }
  }

  replace(
    strings: string[] | TemplateStringsArray,
    ...quasis: any[]
  ): () => void
  replace(replacement: string | Node | Node[] | GetReplacement): void
  replace(
    arg0:
      | string
      | Node
      | Node[]
      | GetReplacement
      | string[]
      | TemplateStringsArray,
    ...quasis: any[]
  ): void | (() => void) {
    const { backend } = this
    const { parsePatternToNodes } = backend
    try {
      const { _matches } = this
      if (typeof arg0 === 'function') {
        replace(
          _matches,
          (match: Match): Node | Node[] => {
            const result = arg0(match, parsePatternToNodes)
            return typeof result === 'string'
              ? parsePatternToNodes(result)
              : result
          },
          { backend }
        )
      } else if (typeof arg0 === 'string') {
        replace(_matches, parsePatternToNodes(arg0), { backend })
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        replace(_matches, arg0, { backend })
      } else {
        return () =>
          replace(_matches, parsePatternToNodes(arg0, ...quasis), { backend })
      }
    } catch (error) {
      if (error instanceof Error) {
        CodeFrameError.rethrow(error, {
          filename: 'replace pattern',
          source: typeof arg0 === 'string' ? arg0 : undefined,
        })
      }
      throw error
    }
  }
}
