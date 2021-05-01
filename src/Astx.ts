import { ASTNode, Collection, JSCodeshift, ASTPath } from 'jscodeshift'
import find, {
  FindOptions,
  Match,
  convertWithCaptures,
  createMatch,
} from './find'
import replace from './replace'
import parseFindOrReplace from './util/parseFindOrReplace'

import compileMatcher from './compileMatcher'

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

export default class Astx {
  jscodeshift: JSCodeshift
  root: Collection
  matches: Match[]
  private parseTag: ParseTag

  constructor(jscodeshift: JSCodeshift, root: Collection | Match[]) {
    this.jscodeshift = jscodeshift
    this.root = Array.isArray(root)
      ? jscodeshift(root.map((m) => m.paths).flat())
      : root
    this.matches = Array.isArray(root)
      ? root
      : root.paths().map((path) => ({
          type: 'node',
          path,
          node: path.node,
          paths: [path],
          nodes: [path.node],
        }))
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
  }

  on(root: Collection | ASTNode | ASTNode[] | ASTPath | ASTPath[]): Astx {
    return new Astx(
      this.jscodeshift,
      Object.getPrototypeOf(root) === Object.getPrototypeOf(this.root)
        ? root
        : this.jscodeshift(root)
    )
  }

  closest(
    strings: TemplateStringsArray,
    ...quasis: any[]
  ): (options?: FindOptions) => Astx
  closest(pattern: string | ASTNode | ASTNode[], options?: FindOptions): Astx
  closest(
    arg0: string | ASTNode | ASTNode[] | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    let paths, options: FindOptions | undefined
    if (typeof arg0 === 'string') {
      paths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, [arg0] as any)
      ).paths()
      options = rest[0]
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      paths = this.jscodeshift(arg0).paths()
      options = rest[0]
    } else if (isNodePath(arg0) || isNodePathArray(arg0)) {
      paths = arg0
      options = rest[0]
    } else {
      const finalPaths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest)
      ).paths()
      return (options?: FindOptions) => this.closest(finalPaths, options) as any
    }
    if (paths.length !== 1) {
      throw new Error(`must be a single node`)
    }
    const { where, withCaptures } = options || {}
    const matcher = compileMatcher(paths[0], { where })

    const matchedParents: Set<ASTPath> = new Set()
    const matches: Match[] = []
    this.root.paths().forEach((path) => {
      let parent = path.parent
      while (parent) {
        if (matchedParents.has(parent)) return
        const match = matcher.match(
          parent,
          withCaptures ? convertWithCaptures(withCaptures) : null
        )
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
    pattern: string | ASTNode | ASTNode[] | ASTPath | ASTPath[],
    options?: FindOptions
  ): Astx
  find(
    arg0: string | ASTNode | ASTNode[] | TemplateStringsArray,
    ...rest: any[]
  ): Astx | ((options?: FindOptions) => Astx) {
    if (typeof arg0 === 'string') {
      return new Astx(
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
      return new Astx(
        this.jscodeshift,
        find(this.root, this.jscodeshift(arg0).paths(), rest[0])
      )
    } else if (isNodePath(arg0) || isNodePathArray(arg0)) {
      return new Astx(this.jscodeshift, find(this.root, arg0, rest[0]))
    } else {
      const paths = this.jscodeshift(
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest)
      ).paths()
      return (options?: FindOptions) => this.find(paths, options)
    }
  }

  replace(strings: TemplateStringsArray, ...quasis: any[]): () => void
  replace(replacement: string | ASTNode | ASTNode[] | GetReplacement): void
  replace(
    arg0: string | ASTNode | ASTNode[] | GetReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void | (() => void) {
    const { matches, parseTag, jscodeshift } = this
    if (typeof arg0 === 'function') {
      replace(
        matches,
        (match: Match): ASTNode => {
          const result = arg0(match, parseTag)
          return typeof result === 'string'
            ? (parseFindOrReplace(jscodeshift, [result] as any) as any)
            : result
        }
      )
    } else if (typeof arg0 === 'string') {
      replace(matches, parseFindOrReplace(jscodeshift, [arg0] as any) as any)
    } else if (isNode(arg0) || isNodeArray(arg0)) {
      replace(matches, arg0 as any)
    } else {
      const parsed = parseFindOrReplace(
        jscodeshift,
        arg0 as any,
        ...quasis
      ) as any
      return () => replace(matches, parsed)
    }
  }
}
