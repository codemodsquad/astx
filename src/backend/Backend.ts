import { NodeType, NodePath, Statement, Expression } from '../types'
import { parsePatternToNodes, parsePattern } from './parse'
import * as template from './template'

export abstract class Backend<Node = any> {
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
  abstract makePath: (node: Node) => NodePath
  abstract isPath: (thing: any) => thing is NodePath
  abstract sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
  abstract getFieldNames: (nodeType: string) => string[]
  abstract defaultFieldValue: (nodeType: string, field: string) => any
  abstract areASTsEqual: (a: Node, b: Node) => boolean
  abstract areFieldValuesEqual: (a: any, b: any) => boolean
  abstract isStatement: (node: any) => node is Statement
  abstract forEachNode: (
    paths: NodePath[],
    nodeTypes: NodeType[],
    iteratee: (path: NodePath) => void
  ) => void
  abstract isTypeFns: Record<string, (node: any) => boolean>
  abstract hasNode: <T = Node>(
    path: NodePath<T>
  ) => path is NodePath<NonNullable<T>>

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
