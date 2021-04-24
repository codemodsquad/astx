import {
  ASTNode,
  Collection,
  Expression,
  JSCodeshift,
  Statement,
} from 'jscodeshift'
import find, { FindOptions, Match, StatementsMatch } from './find'
import { replaceMatches, replaceStatementsMatches } from './replace'
import parseFindOrReplace from './util/parseFindOrReplace'
import t from 'ast-types'
import template from './util/template'

export type ParseTag = (
  strings: TemplateStringsArray,
  ...quasis: any[]
) => ASTNode

export type GetReplacement = (match: Match, parse: ParseTag) => string | ASTNode

export type GetStatementsReplacement = (
  match: StatementsMatch,
  parse: ParseTag
) => string | Expression | Statement | Statement[]

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
  replace(getReplacement: GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | GetReplacement | TemplateStringsArray,
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
    } else {
      replaceMatches(
        this,
        parseFindOrReplace(this.jscodeshift, arg0, ...quasis) as any
      )
    }
  }
}

export class StatementsMatchArray extends Array<StatementsMatch> {
  private jscodeshift: JSCodeshift
  private parseTag: ParseTag

  constructor(jscodeshift: JSCodeshift, matches: Array<StatementsMatch>) {
    super()
    this.jscodeshift = jscodeshift
    for (const key in matches) this[key] = matches[key]
    this.parseTag = parseFindOrReplace.bind(undefined, jscodeshift) as any
  }

  replace(code: string): void
  replace(getReplacement: GetStatementsReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
  replace(
    arg0: string | GetStatementsReplacement | TemplateStringsArray,
    ...quasis: any[]
  ): void {
    if (typeof arg0 === 'function') {
      replaceStatementsMatches(this, (match: StatementsMatch):
        | Statement
        | Statement[] => {
        const result = arg0(match, this.parseTag)
        return typeof result === 'string'
          ? (parseFindOrReplace(this.jscodeshift, [result] as any) as any)
          : result
      })
    } else if (typeof arg0 === 'string') {
      replaceStatementsMatches(
        this,
        parseFindOrReplace(this.jscodeshift, [arg0] as any) as any
      )
    } else {
      replaceStatementsMatches(
        this,
        parseFindOrReplace(this.jscodeshift, arg0, ...quasis) as any
      )
    }
  }
}

function bindFind(
  jscodeshift: JSCodeshift,
  root: Collection,
  pattern: ASTNode
): BoundFind {
  const result = (options?: FindOptions): MatchArray =>
    new MatchArray(jscodeshift, find(root, pattern, options))
  result.replace = (first: any, ...rest: any[]): void =>
    result().replace(first, ...rest)

  return result
}

function bindFindStatements(
  jscodeshift: JSCodeshift,
  root: Collection,
  pattern: Statement[]
): BoundFindStatements {
  const result = (options?: FindOptions): StatementsMatchArray =>
    new StatementsMatchArray(jscodeshift, find(root, pattern, options))
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

  find(code: string, options?: FindOptions): MatchArray | StatementsMatchArray
  find(node: ASTNode, options?: FindOptions): MatchArray
  find(statements: Statement[], options?: FindOptions): StatementsMatchArray
  find(strings: TemplateStringsArray, ...quasis: any[]): BoundFind
  find(
    arg0: string | ASTNode | Statement[] | TemplateStringsArray,
    ...rest: any[]
  ): BoundFind | MatchArray | StatementsMatchArray {
    function requireNotArray(
      parsed: Expression | Statement | Statement[]
    ): ASTNode {
      if (Array.isArray(parsed))
        throw new Error(
          `your pattern has multiple statements, use findStatements instead`
        )
      return parsed as any
    }
    if (typeof arg0 === 'string') {
      return new MatchArray(
        this.jscodeshift,
        find(
          this.root,
          requireNotArray(parseFindOrReplace(this.jscodeshift, [arg0] as any)),
          rest[0]
        )
      )
    } else if (arg0 instanceof Object && !Array.isArray(arg0)) {
      return new MatchArray(
        this.jscodeshift,
        find(this.root, arg0 as any, rest[0])
      )
    } else {
      return bindFind(
        this.jscodeshift,
        this.root,
        requireNotArray(
          parseFindOrReplace(this.jscodeshift, arg0 as any, ...rest)
        )
      )
    }
  }

  findAuto(
    code: string,
    options?: FindOptions
  ): MatchArray | StatementsMatchArray {
    const pattern = parseFindOrReplace(this.jscodeshift, [code] as any)
    return Array.isArray(pattern)
      ? new StatementsMatchArray(
          this.jscodeshift,
          find(this.root, pattern, options)
        )
      : new MatchArray(
          this.jscodeshift,
          find(this.root, pattern as any, options)
        )
  }

  findStatements(code: string, options?: FindOptions): StatementsMatchArray
  findStatements(
    statements: Statement[],
    options?: FindOptions
  ): StatementsMatchArray
  findStatements(
    strings: TemplateStringsArray,
    ...quasis: any[]
  ): BoundFindStatements
  findStatements(
    arg0: string | Statement[] | TemplateStringsArray,
    ...quasis: any[]
  ): BoundFindStatements | StatementsMatchArray {
    if (typeof arg0 === 'string') {
      return new StatementsMatchArray(
        this.jscodeshift,
        find(this.root, template(this.jscodeshift).statements([arg0], quasis))
      )
    } else if (Array.isArray(arg0) && t.namedTypes.Statement.check(arg0[0])) {
      return new StatementsMatchArray(
        this.jscodeshift,
        find(this.root, arg0 as Statement[])
      )
    } else {
      return bindFindStatements(
        this.jscodeshift,
        this.root,
        parseFindOrReplace(this.jscodeshift, arg0 as any, ...quasis) as any
      )
    }
  }
}

interface BoundFind {
  (options?: FindOptions): MatchArray
  replace(code: string): void
  replace(getReplacement: GetReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
}

interface BoundFindStatements {
  (options?: FindOptions): StatementsMatchArray
  replace(code: string): void
  replace(getReplacement: GetStatementsReplacement): void
  replace(strings: TemplateStringsArray, ...quasis: any[]): void
}
