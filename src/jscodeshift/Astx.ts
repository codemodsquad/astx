import { ASTNode, JSCodeshift, ASTPath } from 'jscodeshift'
import find, { Match, convertWithCaptures, createMatch } from './find'
import replace from './replace'
import parseFindOrReplace from './util/parseFindOrReplace'
import compileMatcher, { MatchResult } from './compileMatcher'

export type ParseTag = (
  strings: TemplateStringsArray,
  ...quasis: any[]
) => ASTNode

export type GetReplacement = (
  match: Match,
  parse: ParseTag
) => string | ASTNode | ASTNode[]

function isNode(x: unknown): x is ASTNode {
  return x instanceof Object && typeof (x as any).type === 'string'
}
function isNodeArray(x: unknown): x is ASTNode[] {
  return Array.isArray(x) && !Array.isArray((x as any).raw)
}
function isNodePath(x: unknown): x is ASTPath {
  return x instanceof Object && typeof (x as any).insertAt === 'function'
}
function isNodePathArray(x: unknown): x is ASTPath[] {
  return Array.isArray(x) && !Array.isArray((x as any).raw) && isNodePath(x[0])
}

export type FindOptions = {
  where?: { [captureName: string]: (path: ASTPath) => boolean }
}

export default class Astx {
  jscodeshift: JSCodeshift
  private _paths: ASTPath<any>[]
  private _matches: Match[]
  private _parseTag: ParseTag
  private _withCaptures: Match[]

  constructor(
    jscodeshift: JSCodeshift,
    paths: ASTPath<any>[] | Match[],
    { withCaptures = [] }: { withCaptures?: Match[] } = {}
  ) {
    this.jscodeshift = jscodeshift
    this._paths = isNodePath(paths[0])
      ? (paths as ASTPath[])
      : (paths as Match[]).map((m) => m.paths).flat()
    this._matches = isNodePath(paths[0])
      ? (paths as ASTPath[]).map((path) => ({
          type: 'node',
          path,
          node: path.node,
          paths: [path],
          nodes: [path.node],
        }))
      : (paths as Match[])
    this._parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
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

  paths(): ASTPath[] {
    return this._paths
  }

  nodes(): ASTNode[] {
    return this._paths.map((p) => p.node)
  }

  filter(
    iteratee: (match: Match, index: number, matches: Match[]) => boolean
  ): Astx {
    return new Astx(this.jscodeshift, this._matches.filter(iteratee))
  }

  at(index: number): Astx {
    return new Astx(this.jscodeshift, [this._matches[index]])
  }

  on(root: ASTPath<any> | ASTPath<any>[] | Match | Match[]): Astx {
    return new Astx(
      this.jscodeshift,
      Array.isArray(root) ? root : ([root] as ASTPath<any>[] | Match[])
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
    return new Astx(this.jscodeshift, this._matches, {
      withCaptures,
    })
  }

  captures(name: string): Astx {
    const matches: Match[] = []
    for (const match of this._matches) {
      const capture = match.pathCaptures?.[name]
      if (capture) matches.push(createMatch(capture, {}))
    }
    return new Astx(this.jscodeshift, matches)
  }

  captureNode(name: string): ASTNode | null {
    for (const match of this._matches) {
      const capture = match.captures?.[name]
      if (capture) return capture
    }
    return null
  }

  capturePath(name: string): ASTPath | null {
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
    return new Astx(this.jscodeshift, matches)
  }

  arrayCaptureNodes(name: string): ASTNode[] | null {
    for (const match of this._matches) {
      const capture = match.arrayCaptures?.[name]
      if (capture) return capture
    }
    return null
  }

  arrayCapturePaths(name: string): ASTPath[] | null {
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
    pattern: string | ASTNode | ASTNode[] | ASTPath<any> | ASTPath<any>[],
    options?: FindOptions
  ): Astx
  closest(
    arg0:
      | string
      | ASTNode
      | ASTNode[]
      | ASTPath<any>
      | ASTPath<any>[]
      | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    let paths: ASTPath<any>[], options: FindOptions | undefined
    if (typeof arg0 === 'string') {
      paths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, [arg0] as any) as
          | ASTNode
          | ASTNode[]
      ).paths()
      options = rest[0]
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      paths = this.jscodeshift(arg0).paths()
      options = rest[0]
    } else if (isNodePath(arg0)) {
      paths = [arg0]
      options = rest[0]
    } else if (isNodePathArray(arg0)) {
      paths = arg0
      options = rest[0]
    } else {
      const finalPaths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest) as
          | ASTNode
          | ASTNode[]
      ).paths()
      return (options?: FindOptions) => this.closest(finalPaths, options) as any
    }
    if (paths.length !== 1) {
      throw new Error(`must be a single node`)
    }
    const matcher = compileMatcher(paths[0], options)
    const matchSoFar = this._createInitialMatch()

    const matchedParents: Set<ASTPath> = new Set()
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

    return new Astx(this.jscodeshift, matches)
  }

  find(
    strings: TemplateStringsArray,
    ...quasis: any[]
  ): (options?: FindOptions) => Astx
  find(
    pattern: string | ASTNode | ASTNode[] | ASTPath<any> | ASTPath<any>[],
    options?: FindOptions
  ): Astx
  find(
    arg0:
      | string
      | ASTNode
      | ASTNode[]
      | ASTPath<any>
      | ASTPath<any>[]
      | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    let pattern, options: FindOptions | undefined
    if (typeof arg0 === 'string') {
      pattern = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, [arg0] as any) as
          | ASTNode
          | ASTNode[]
      ).paths()
      options = rest[0]
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      pattern = this.jscodeshift(arg0).paths()
      options = rest[0]
    } else if (isNodePath(arg0) || isNodePathArray(arg0)) {
      pattern = arg0
      options = rest[0]
    } else {
      const finalPaths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest) as
          | ASTNode
          | ASTNode[]
      ).paths()
      return (options?: FindOptions) => this.find(finalPaths, options) as any
    }
    return new Astx(
      this.jscodeshift,
      find(this._paths, pattern, {
        ...options,
        matchSoFar: this._createInitialMatch(),
      })
    )
  }

  replace(strings: TemplateStringsArray, ...quasis: any[]): () => void
  replace(replacement: string | ASTNode | ASTNode[] | GetReplacement): void
  replace(
    arg0: string | ASTNode | ASTNode[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void | (() => void) {
    const { _matches, _parseTag, jscodeshift } = this
    if (typeof arg0 === 'function') {
      replace(
        _matches,
        (match: Match): ASTNode => {
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
  }
}
