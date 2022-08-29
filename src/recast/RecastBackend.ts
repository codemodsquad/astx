import { NodeType, NodePath, Statement, Expression } from '../types'
import { Backend } from '../backend/Backend'
import areASTsEqual, { areFieldValuesEqual } from './util/areASTsEqual'
import getFieldNames from './util/getFieldNames'
import { visit, Visitor } from 'ast-types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import RecastNodePath from './RecastNodePath'
import * as defaultRecast from 'recast'
import * as t from 'ast-types'
import * as k from 'ast-types/gen/kinds'

type Node = k.NodeKind

export default class RecastBackend extends Backend<Node> {
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  makePath: (node: Node) => NodePath
  isPath: (thing: any) => thing is NodePath
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
  getFieldNames: (nodeType: string) => string[]
  defaultFieldValue: (nodeType: string, field: string) => any
  areASTsEqual: (a: Node, b: Node) => boolean
  areFieldValuesEqual: (a: any, b: any) => boolean
  isStatement: (node: any) => node is Statement
  forEachNode: (
    paths: NodePath[],
    nodeTypes: NodeType[],
    iteratee: (path: NodePath) => void
  ) => void
  isTypeFns: Record<string, (node: any) => boolean>
  hasNode: <T = Node>(path: NodePath<T>) => path is NodePath<NonNullable<T>>

  constructor({
    recast = defaultRecast,
    parseOptions,
  }: {
    recast?: typeof defaultRecast
    parseOptions?: defaultRecast.Options
  } = {}) {
    super()
    this.parse = (code: string) => recast.parse(code, parseOptions)
    this.parseStatements = (code: string): Statement[] => {
      const ast: k.FileKind = recast.parse(code, parseOptions)
      const errors =
        ast.type === 'File' ? (ast.program as any).errors : (ast as any).errors
      if (errors?.length) {
        // Flow parser returns a bogus AST instead of throwing when the grammar is invalid,
        // but it at least includes parse errors in this array
        throw new Error(errors[0].message)
      }
      return ast.program.body
    }
    this.parseExpression = (code: string): Expression => {
      // wrap code in `(...)` to force evaluation as expression
      const statements = this.parseStatements(`(${code})`)
      let expression: Expression
      if (statements[0]?.type === 'ExpressionStatement') {
        expression = statements[0].expression
      } else {
        throw new Error(`invalid expression: ${code}`)
      }

      // Remove added parens
      if ((expression as any).extra) {
        ;(expression as any).extra.parenthesized = false
      }

      return expression
    }
    this.generate = (node: Node): { code: string } => recast.print(node)
    this.makePath = (node: Node) => RecastNodePath.wrap(new t.NodePath(node))
    this.isPath = (thing: any): thing is NodePath =>
      thing instanceof RecastNodePath
    this.sourceRange = (node: Node) =>
      Array.isArray((node as any).range)
        ? (node as any).range
        : [(node as any).start, (node as any).end]
    this.getFieldNames = (nodeType: string) =>
      getFieldNames({ type: nodeType } as any)
    this.defaultFieldValue = (nodeType: string, field: string) =>
      t.getFieldValue({ type: nodeType } as any, field)
    this.areASTsEqual = areASTsEqual
    this.areFieldValuesEqual = areFieldValuesEqual
    this.isStatement = (node: any): node is Statement =>
      t.namedTypes.Statement.check(node)
    this.forEachNode = (
      paths: NodePath[],
      nodeTypes: NodeType[],
      iteratee: (path: NodePath) => void
    ): void => {
      function visitNode(this: any, path: ASTPath<Node>) {
        iteratee(RecastNodePath.wrap(path) as NodePath)
        this.traverse(path)
      }
      const visitor: Visitor<any> = {}
      for (const nodeType of nodeTypes) {
        if (nodeType === 'Block') {
          visitor.visitProgram = visitNode
          visitor.visitBlockStatement = visitNode
          visitor.visitTSModuleBlock = visitNode
        } else {
          ;(visitor as any)[`visit${nodeType}`] = visitNode
        }
      }

      paths.forEach((path: NodePath) => visit(path.node, visitor))
    }
    this.isTypeFns = Object.fromEntries(
      [...Object.entries(t.namedTypes)].map(([key, value]) => [
        key,
        (node: any) => value.check(node),
      ])
    )
    this.hasNode = <T = any>(
      path: NodePath<T>
    ): path is NodePath<NonNullable<T>> => t.namedTypes.Node.check(path.node)
  }
}
