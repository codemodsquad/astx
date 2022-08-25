import { NodeType, NodePath, Statement, Expression } from './types'

export type Backend<Node = any> = {
  parse: (code: string) => Node
  template: {
    smart: (code: string) => Node | Statement[]
    expression: (code: string) => Expression
    statements: (code: string) => Statement[]
  }
  generate: (node: Node) => { code: string }
  rootPath: (node: Node) => NodePath
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
  getFieldNames: (nodeType: string) => string[]
  defaultFieldValue: (nodeType: string, field: string) => any
  areASTsEqual: (a: Node, b: Node) => any
  areFieldValuesEqual: (a: any, b: any) => boolean
  isStatement: (node: any) => node is Statement
  forEachNode: (
    paths: NodePath[],
    nodeTypes: NodeType[],
    iteratee: (path: NodePath) => void
  ) => void
  isTypeFns: Record<string, (node: any) => boolean>
  hasNode: <T = Node>(path: NodePath<T>) => path is NodePath<NonNullable<T>>
}
