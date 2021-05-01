import { ASTNode, Collection, JSCodeshift, ASTPath } from 'jscodeshift'
import find, { FindOptions, Match } from './find'
import replace from './replace'
import parseFindOrReplace from './util/parseFindOrReplace'

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

export class ReplaceableMatch {
  private jscodeshift: JSCodeshift
  private parseTag: ParseTag
  private match: Match
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

  constructor(jscodeshift: JSCodeshift, match: Match) {
    this.jscodeshift = jscodeshift
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
    this.match = match
    this.type = match.type
    this.path = match.path
    this.node = match.node
    this.paths = match.paths
    this.nodes = match.nodes
    this.pathCaptures = match.pathCaptures
    this.captures = match.captures
    this.arrayPathCaptures = match.arrayPathCaptures
    this.arrayCaptures = match.arrayCaptures
    this.stringCaptures = match.stringCaptures
  }

  replace(replacement: string | ASTNode | ASTNode[] | GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | ASTNode | ASTNode[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void {
    if (typeof arg0 === 'function') {
      replace(
        [this.match],
        (match: Match): ASTNode => {
          const result = arg0(match, this.parseTag)
          return typeof result === 'string'
            ? (parseFindOrReplace(this.jscodeshift, [result] as any) as any)
            : result
        }
      )
    } else if (typeof arg0 === 'string') {
      replace(
        [this.match],
        parseFindOrReplace(this.jscodeshift, [arg0] as any) as any
      )
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      replace([this.match], arg0 as any)
    } else {
      replace(
        [this.match],
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...quasis) as any
      )
    }
  }
}

export class MatchArray extends Array<ReplaceableMatch> {
  private jscodeshift: JSCodeshift
  private parseTag: ParseTag

  constructor(jscodeshift: JSCodeshift, matches: Array<Match>) {
    super()
    this.jscodeshift = jscodeshift
    for (const key in matches)
      this[key] = new ReplaceableMatch(jscodeshift, matches[key])
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
  }

  replace(replacement: string | ASTNode | ASTNode[] | GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | ASTNode | ASTNode[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void {
    if (typeof arg0 === 'function') {
      replace(
        this,
        (match: Match): ASTNode => {
          const result = arg0(match, this.parseTag)
          return typeof result === 'string'
            ? (parseFindOrReplace(this.jscodeshift, [result] as any) as any)
            : result
        }
      )
    } else if (typeof arg0 === 'string') {
      replace(this, parseFindOrReplace(this.jscodeshift, [arg0] as any) as any)
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      replace(this, arg0 as any)
    } else {
      replace(
        this,
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...quasis) as any
      )
    }
  }
}

function bindFind(
  jscodeshift: JSCodeshift,
  root: Collection,
  pattern: ASTPath | ASTPath[]
): BoundFind {
  const result = (options?: FindOptions): MatchArray =>
    new MatchArray(jscodeshift, find(root, pattern, options))
  result.replace = (first: any, ...rest: any[]): void =>
    result().replace(first, ...rest)

  return result
}

export default class Astx {
  jscodeshift: JSCodeshift
  root: Collection

  constructor(jscodeshift: JSCodeshift, root: Collection) {
    this.jscodeshift = jscodeshift
    this.root = root
  }

  on(root: Collection | ASTNode | ASTNode[] | ASTPath | ASTPath[]): Astx {
    return new Astx(
      this.jscodeshift,
      Object.getPrototypeOf(root) === Object.getPrototypeOf(this.root)
        ? root
        : this.jscodeshift(root)
    )
  }

  find(pattern: string | ASTNode | ASTNode[], options?: FindOptions): MatchArray
  find(strings: TemplateStringsArray, ...quasis: any[]): BoundFind
  find(
    arg0: string | ASTNode | ASTNode[] | TemplateStringsArray,
    ...rest: any[]
  ): BoundFind | MatchArray {
    if (typeof arg0 === 'string') {
      return new MatchArray(
        this.jscodeshift,
        find(
          this.root,
          this.jscodeshift(
            parseFindOrReplace(this.jscodeshift, [arg0] as any)
          ).paths(),
          rest[0]
        )
      )
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      return new MatchArray(
        this.jscodeshift,
        find(this.root, this.jscodeshift(arg0).paths(), rest[0])
      )
    } else {
      return bindFind(
        this.jscodeshift,
        this.root,
        this.jscodeshift(
          parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest)
        ).paths()
      )
    }
  }
}

interface BoundFind {
  (options?: FindOptions): MatchArray
  replace(replacement: string | ASTNode | ASTNode[] | GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
}
