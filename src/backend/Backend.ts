import { NodeType, NodePath, Statement, Expression } from '../types'

export abstract class Backend<Node = any> {
  abstract parse: (code: string) => Node
  abstract parseExpression: (code: string) => Expression
  abstract parseStatements: (code: string) => Statement[]
  abstract generate: (node: Node) => { code: string }
  abstract makePath: (node: Node) => NodePath
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
}
