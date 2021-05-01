import { ASTNode, Collection, JSCodeshift, ASTPath } from 'jscodeshift'
import find, { FindOptions, Match } from './find'
import { replaceMatches } from './replace'
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

export class MatchArray extends Array<Match> {
  private jscodeshift: JSCodeshift
  private parseTag: ParseTag

  constructor(jscodeshift: JSCodeshift, matches: Array<Match>) {
    super()
    this.jscodeshift = jscodeshift
    for (const key in matches) this[key] = matches[key]
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
  }

  replace(code: string): void
  replace(node: ASTNode): void
  replace(nodes: ASTNode[]): void
  replace(getReplacement: GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | ASTNode | ASTNode[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void {
    if (typeof arg0 === 'function') {
      replaceMatches(
        this,
        (match: Match): ASTNode => {
          const result = arg0(match, this.parseTag)
          return typeof result === 'string'
            ? (parseFindOrReplace(this.jscodeshift, [result] as any) as any)
            : result
        }
      )
    } else if (typeof arg0 === 'string') {
      replaceMatches(
        this,
        parseFindOrReplace(this.jscodeshift, [arg0] as any) as any
      )
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      replaceMatches(this, arg0 as any)
    } else {
      replaceMatches(
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

  on(root: Collection): Astx {
    return new Astx(this.jscodeshift, root)
  }

  find(code: string, options?: FindOptions): MatchArray
  find(node: ASTNode, options?: FindOptions): MatchArray
  find(nodes: ASTNode[], options?: FindOptions): MatchArray
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
  replace(code: string): void
  replace(node: ASTNode): void
  replace(nodes: ASTNode[]): void
  replace(getReplacement: GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
}
