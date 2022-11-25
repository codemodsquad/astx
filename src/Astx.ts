import { Expression, Statement, Node, NodePath } from './types'
import { Backend } from './backend/Backend'
import find, { Match, convertWithCaptures, createMatch } from './find'
import replace from './replace'
import compileMatcher, { MatchResult } from './compileMatcher'
import CodeFrameError from './util/CodeFrameError'
import ensureArray from './util/ensureArray'
import * as AstTypes from 'ast-types'

export type TransformOptions = {
  /** The absolute path to the current file. */
  file: string
  /** The source code of the current file. */
  source: string
  astx: Astx
  expression(strings: TemplateStringsArray, ...quasis: any[]): Expression
  statement(strings: TemplateStringsArray, ...quasis: any[]): Statement
  statements(strings: TemplateStringsArray, ...quasis: any[]): Statement[]
  t: typeof AstTypes
  report: (msg: unknown) => void
}

export type TransformFunction = (
  options: TransformOptions
) => string | null | undefined | void

export type Transform = {
  astx?: TransformFunction
  find?: string | Node | Node[]
  replace?: string | Node | Node[] | GetReplacement
  where?: FindOptions['where']
  onReport?: (options: { file: string; report: unknown }) => void
  finish?: () => any
}

export type TransformResult = {
  file: string
  source?: string
  transformed?: string
  reports?: unknown[]
  error?: Error
  matches?: readonly Match[]
  backend: Backend
}

export type ParsePattern = (
  strings: string | string[] | TemplateStringsArray,
  ...quasis: any[]
) => Node | Node[]

export type GetReplacement = (
  astx: Astx,
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

class ExtendableProxy {
  constructor(handler: ProxyHandler<any>) {
    return new Proxy(this, handler)
  }
}

export default class Astx extends ExtendableProxy implements Iterable<Astx> {
  [name: `$${string}` | `$$${string}` | `$$$${string}`]: Astx
  public readonly backend: Backend
  private readonly _matches: Match[]
  private readonly _withCaptures: Match[]
  private readonly _placeholder: string | undefined
  private _lazyPaths: NodePath<Node, any>[] | undefined
  private _lazyNodes: Node[] | undefined
  private _lazyInitialMatch: MatchResult | undefined

  constructor(
    backend: Backend,
    paths: NodePath<any>[] | Match[],
    {
      withCaptures = [],
      placeholder,
    }: { withCaptures?: Match[]; placeholder?: string } = {}
  ) {
    super({
      get(target: Astx, prop: string): Astx {
        if (typeof prop === 'symbol' || !prop.startsWith('$'))
          return (target as any)[prop]
        const matches: Match[] = []
        for (const {
          arrayPathCaptures,
          pathCaptures,
          stringCaptures,
        } of target._matches) {
          const path = pathCaptures?.[prop]
          const stringValue = stringCaptures?.[prop]
          const arrayPaths = arrayPathCaptures?.[prop]
          if (path)
            matches.push(
              createMatch(path, {
                stringCaptures: stringValue
                  ? { [prop]: stringValue }
                  : undefined,
              })
            )
          if (arrayPaths) matches.push(createMatch(arrayPaths, {}))
        }
        return new Astx(target.backend, matches, { placeholder: prop })
      },
    })
    this.backend = backend
    this._placeholder = placeholder
    const { NodePath } = backend.t
    this._matches =
      paths[0] instanceof NodePath
        ? (paths as NodePath[]).map((path) => createMatch(path, {}))
        : (paths as Match[])
    this._withCaptures = withCaptures
  }

  get size(): number {
    return this._matches.length
  }

  get matches(): readonly Match[] {
    return this._matches
  }

  *[Symbol.iterator](): Iterator<Astx> {
    if (this._placeholder && this._matches.length === 1) {
      for (const path of this.match.paths) {
        yield new Astx(this.backend, [path])
      }
    } else {
      for (const match of this._matches) {
        yield new Astx(this.backend, [match])
      }
    }
  }

  get match(): Match {
    const [match] = this._matches
    if (!match) {
      throw new Error(`you can't call match() when there are no matches`)
    }
    return match
  }

  get node(): Node {
    return this.match.node
  }

  get path(): NodePath {
    return this.match.path
  }

  get code(): string {
    return this.backend.generate(this.node).code
  }

  get stringValue(): string {
    const result = this.match.stringCaptures?.[this._placeholder || '']
    if (!result) throw new Error(`not a string capture`)
    return result
  }

  get paths(): readonly NodePath[] {
    return (
      this._lazyPaths ||
      (this._lazyPaths = this.matches.map((m) => m.paths).flat())
    )
  }

  get nodes(): readonly Node[] {
    return (
      this._lazyNodes ||
      (this._lazyNodes = this.matches.map((m) => m.nodes).flat())
    )
  }

  filter(iteratee: (astx: Astx, index: number, parent: Astx) => boolean): Astx {
    const filtered = []
    let index = 0
    for (const astx of this) {
      if (iteratee(astx, index++, this)) {
        filtered.push(astx.match)
      }
    }
    return new Astx(this.backend, filtered)
  }

  map<T>(iteratee: (astx: Astx, index: number, parent: Astx) => T): T[] {
    const result = []
    let index = 0
    for (const astx of this) {
      result.push(iteratee(astx, index++, this))
    }
    return result
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

  private get initialMatch(): MatchResult {
    return (
      this._lazyInitialMatch ||
      (this._lazyInitialMatch = convertWithCaptures([
        ...this._matches,
        ...this._withCaptures,
      ]))
    )
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
      let paths: readonly NodePath<any>[], options: FindOptions | undefined
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

      const matchedParents: Set<NodePath> = new Set()
      const matches: Match[] = []
      this.paths.forEach((path) => {
        for (let p = path.parentPath; p; p = p.parentPath) {
          if (matchedParents.has(p)) return
          const match = matcher.match(p, this.initialMatch)
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
        find(this.paths, pattern, {
          ...options,
          backend,
          matchSoFar: this.initialMatch,
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
      if (typeof arg0 === 'function') {
        for (const astx of this) {
          const replacement = arg0(astx, parsePatternToNodes)
          replace(
            astx.match,
            typeof replacement === 'string'
              ? parsePatternToNodes(replacement)
              : replacement,
            { backend }
          )
        }
      } else if (typeof arg0 === 'string') {
        const replacement = parsePatternToNodes(arg0)
        for (const match of this._matches) {
          replace(match, replacement, { backend })
        }
      } else if (isNode(arg0) || isNodeArray(arg0)) {
        for (const match of this._matches) {
          replace(match, arg0, { backend })
        }
      } else {
        return () => this.replace(parsePatternToNodes(arg0, ...quasis))
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
