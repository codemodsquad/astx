import { NodePath, Statement, Expression, Location, Comment } from '../types'
import { parsePatternToNodes, parsePattern } from './parse'
import * as template from './template'
import * as AstTypes from 'ast-types'

export type GetBackend = (
  file: string,
  options?: { [k in string]?: any }
) => Promise<Backend>

export abstract class Backend<Node = any> {
  abstract readonly t: typeof AstTypes
  abstract readonly parse: (code: string) => Node
  abstract readonly parseExpression: (code: string) => Expression
  abstract readonly parseStatements: (code: string) => Statement[]
  readonly template: {
    readonly statements: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Statement[]
    readonly statement: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Statement
    readonly expression: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Expression
  }
  readonly parsePattern: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => NodePath | NodePath[]
  readonly parsePatternToNodes: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => Node | Node[]

  abstract readonly generate: (node: Node) => { code: string }
  abstract readonly location: (node: Node) => Location
  abstract readonly comments: (
    node: Node,
    kind?: 'leading' | 'inner' | 'trailing'
  ) => Iterable<Comment>
  abstract removeComments(node: Node): void

  constructor() {
    this.template = {
      statements: template.statements.bind(this),
      statement: template.statement.bind(this),
      expression: template.expression.bind(this),
    }
    this.parsePattern = parsePattern.bind(this)
    this.parsePatternToNodes = parsePatternToNodes.bind(this) as any
  }
}
