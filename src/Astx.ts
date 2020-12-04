import { ASTNode, Collection, JSCodeshift } from 'jscodeshift'
import find, { FindOptions, Match } from './find'
import { replaceMatches } from './replace'
import parseFindOrReplace from './util/parseFindOrReplace'

export type ParseTag = (
  strings: TemplateStringsArray,
  ...quasis: any[]
) => ASTNode
export type GetReplacement<Node extends ASTNode> = (
  match: Match<Node>,
  parse: ParseTag
) => ASTNode

export class MatchArray<Node extends ASTNode> extends Array<Match<Node>> {
  private jscodeshift: JSCodeshift
  private parseTag: ParseTag

  constructor(jscodeshift: JSCodeshift, matches: Array<Match<Node>>) {
    super()
    this.jscodeshift = jscodeshift
    for (const key in matches) this[key] = matches[key]
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift)
  }

  replace(code: string): void
  replace(getReplacement: GetReplacement<Node>): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | GetReplacement<Node> | TemplateStringsArray,
    ...quasis: any[]
  ): void {
    if (typeof arg0 === 'function') {
      replaceMatches(this, (match: Match<Node>) => arg0(match, this.parseTag))
    } else if (typeof arg0 === 'string') {
      replaceMatches(this, parseFindOrReplace(this.jscodeshift, [arg0] as any))
    } else {
      replaceMatches(
        this,
        parseFindOrReplace(this.jscodeshift, arg0, ...quasis)
      )
    }
  }
}

function bindFind(
  jscodeshift: JSCodeshift,
  root: Collection,
  query: ASTNode
): BoundFind {
  const result = (options?: FindOptions): MatchArray<any> =>
    new MatchArray(jscodeshift, find(root, query, options))
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

  find(code: string, options?: FindOptions): MatchArray<any>
  find<Node extends ASTNode>(
    node: ASTNode,
    options?: FindOptions
  ): MatchArray<Node>
  find(strings: TemplateStringsArray, ...quasis: any[]): BoundFind
  find(
    arg0: string | ASTNode | TemplateStringsArray,
    ...quasis: any[]
  ): BoundFind | MatchArray<any> {
    if (typeof arg0 === 'string') {
      return new MatchArray(
        this.jscodeshift,
        find(
          this.root,
          parseFindOrReplace(this.jscodeshift, [arg0] as any),
          quasis[0]
        )
      )
    } else if (arg0 instanceof Object && !Array.isArray(arg0)) {
      return new MatchArray(
        this.jscodeshift,
        find(this.root, arg0 as any, quasis[0])
      )
    } else {
      return bindFind(
        this.jscodeshift,
        this.root,
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...quasis)
      )
    }
  }
}

interface BoundFind {
  (options?: FindOptions): MatchArray<any>
  replace(code: string): void
  replace(getReplacement: GetReplacement<any>): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
}
