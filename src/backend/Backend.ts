import { NodePath, Statement, Expression } from '../types'
import { parsePatternToNodes, parsePattern } from './parse'
import * as template from './template'
import * as AstTypes from 'ast-types'

export type GetBackend = (
  file: string,
  options?: { [k in string]?: any }
) => Promise<Backend>

export abstract class Backend<Node = any> {
  abstract t: typeof AstTypes
  abstract parse: (code: string) => Node
  abstract parseExpression: (code: string) => Expression
  abstract parseStatements: (code: string) => Statement[]
  template: {
    statements: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Statement[]
    statement: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Statement
    expression: (
      code: TemplateStringsArray | string[] | string,
      ...nodes: any[]
    ) => Expression
  }
  parsePattern: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => NodePath | NodePath[]
  parsePatternToNodes: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => Node | Node[]

  abstract generate: (node: Node) => { code: string }
  abstract sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]

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
