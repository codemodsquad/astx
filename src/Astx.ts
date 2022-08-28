import { Node, NodePath } from './types'
import { Backend } from './backend/Backend'
import find, { Match, convertWithCaptures, createMatch } from './find'
import replace from './replace'
import compileMatcher, { MatchResult } from './compileMatcher'
import CodeFrameError from './util/CodeFrameError'
import createParse from './createParse'

export type ParseTag = (
  strings: string | string[] | TemplateStringsArray,
  ...quasis: any[]
) => Node | Node[]

export type GetReplacement = (
  match: Match,
  parse: ParseTag
) => string | Node | Node[]

function isNode(x: unknown): x is Node {
  return x instanceof Object && typeof (x as any).type === 'string'
}
function isNodeArray(x: unknown): x is Node[] {
  return Array.isArray(x) && !Array.isArray((x as any).raw)
}
function isNodePath(x: unknown): x is NodePath {
  return x instanceof Object && typeof (x as any).insertAt === 'function'
}
function isNodePathArray(x: unknown): x is NodePath[] {
  return Array.isArray(x) && !Array.isArray((x as any).raw) && isNodePath(x[0])
}

export type FindOptions = {
  where?: { [captureName: string]: (path: NodePath) => boolean }
}

export default class Astx {
  private backend: Backend
  private _paths: NodePath<any>[]
  private _matches: Match[]
  private _parseTag: ParseTag
  private _withCaptures: Match[]

  constructor(
    backend: Backend,
    paths: NodePath<any>[] | Match[],
    { withCaptures = [] }: { withCaptures?: Match[] } = {}
  ) {
    this.backend = backend
    this._paths = isNodePath(paths[0])
      ? (paths as NodePath[])
      : (paths as Match[]).map((m) => m.paths).flat()
    this._matches = isNodePath(paths[0])
      ? (paths as NodePath[]).map((path) => ({
          type: 'node',
          path,
          node: path.node,
          paths: [path],
          nodes: [path.node],
        }))
      : (paths as Match[])
    this._parseTag = createParse(backend).parseNodes
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

  nodes(): Node[] {
    return this._paths.map((p) => p.node)
  }

  filter(
    iteratee: (match: Match, index: number, matches: Match[]) => boolean
  ): Astx {
    return new Astx(this.backend, this._matches.filter(iteratee))
  }

  at(index: number): Astx {
    return new Astx(this.backend, [this._matches[index]])
  }

  on(root: NodePath<any> | NodePath<any>[] | Match | Match[]): Astx {
    return new Astx(
      this.backend,
      Array.isArray(root) ? root : ([root] as NodePath<any>[] | Match[])
    )
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
    try {
      let paths: NodePath<any>[], options: FindOptions | undefined
      if (typeof arg0 === 'string') {
        paths = this.backend(
          parseFindOrReplace(this.backend, [arg0] as any) as Node | Node[]
        ).paths()
        options = rest[0]
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        paths = this.backend(arg0).paths()
        options = rest[0]
      } else if (isNodePath(arg0)) {
        paths = [arg0]
        options = rest[0]
      } else if (isNodePathArray(arg0)) {
        paths = arg0
        options = rest[0]
      } else {
        const finalPaths = this.backend(
          parseFindOrReplace(this.backend, arg0 as any, ...rest) as
            | Node
            | Node[]
        ).paths()
        return (options?: FindOptions) =>
          this.closest(finalPaths, options) as any
      }
      if (paths.length !== 1) {
        throw new Error(`must be a single node`)
      }
      const matcher = compileMatcher(paths[0], options)
      const matchSoFar = this._createInitialMatch()

      const matchedParents: Set<NodePath> = new Set()
      const matches: Match[] = []
      this._paths.forEach((path) => {
        let parent = path.parent
        while (parent) {
          if (matchedParents.has(parent)) return
          const match = matcher.match(parent, matchSoFar)
          if (match) {
            matchedParents.add(parent)
            matches.push(createMatch(parent, match))
            return
          }
          parent = parent.parent
        }
      })

      return new Astx(this.backend, matches)
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
    strings: TemplateStringsArray,
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
      | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    try {
      let pattern, options: FindOptions | undefined
      if (typeof arg0 === 'string') {
        pattern = this.backend(
          parseFindOrReplace(this.backend, [arg0] as any) as Node | Node[]
        ).paths()
        options = rest[0]
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        pattern = this.backend(arg0).paths()
        options = rest[0]
      } else if (isNodePath(arg0) || isNodePathArray(arg0)) {
        pattern = arg0
        options = rest[0]
      } else {
        const finalPaths = this.backend(
          parseFindOrReplace(this.backend, arg0 as any, ...rest) as
            | Node
            | Node[]
        ).paths()
        return (options?: FindOptions) => this.find(finalPaths, options) as any
      }
      return new Astx(
        this.backend,
        find(this._paths, pattern, {
          ...options,
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

  replace(strings: TemplateStringsArray, ...quasis: any[]): () => void
  replace(replacement: string | Node | Node[] | GetReplacement): void
  replace(
    arg0: string | Node | Node[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void | (() => void) {
    try {
      const { _matches, _parseTag, jscodeshift } = this
      if (typeof arg0 === 'function') {
        replace(
          _matches,
          (match: Match): Node => {
            const result = arg0(match, _parseTag)
            return typeof result === 'string'
              ? (parseFindOrReplace(jscodeshift, [result] as any) as any)
              : result
          }
        )
      } else if (typeof arg0 === 'string') {
        replace(_matches, parseFindOrReplace(jscodeshift, [arg0] as any) as any)
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        replace(_matches, arg0 as any)
      } else {
        const parsed = parseFindOrReplace(
          jscodeshift,
          arg0 as any,
          ...quasis
        ) as any
        return () => replace(_matches, parsed)
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
