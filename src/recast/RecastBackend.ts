import { NodeType, NodePath, Statement, Expression } from '../types'
import { Backend } from '../backend/Backend'
import shallowEqual from 'shallowequal'
import { visit, Visitor } from 'ast-types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import RecastNodePath from './RecastNodePath'
import * as defaultRecast from 'recast'
import * as t from 'ast-types'
import fork from 'ast-types/fork'
import esProposalsDef from 'ast-types/def/es-proposals'
import jsxDef from 'ast-types/def/jsx'
import flowDef from 'ast-types/def/flow'
import esprimaDef from 'ast-types/def/esprima'
import babelDef from 'ast-types/def/babel'
import typescriptDef from 'ast-types/def/typescript'
import * as k from 'ast-types/gen/kinds'
import addMissingFields from './util/addMissingFIelds'

type Node = k.NodeKind

export default class RecastBackend extends Backend<Node> {
  t: typeof t
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  makePath: (node: Node) => NodePath
  isPath: (thing: any) => thing is NodePath
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
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
    this.t = fork([
      // Feel free to add to or remove from this list of extension modules to
      // configure the precise type hierarchy that you need.
      esProposalsDef,
      jsxDef,
      flowDef,
      esprimaDef,
      babelDef,
      typescriptDef,
      addMissingFields,
    ])
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
    this.areASTsEqual = t.astNodesAreEquivalent
    this.areFieldValuesEqual = function areFieldValuesEqual(
      a: any,
      b: any
    ): boolean {
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || b.length !== a.length) return false
        return a.every((value, index) => areFieldValuesEqual(value, b[index]))
      } else if (t.namedTypes.Node.check(a)) {
        return (
          t.namedTypes.Node.check(b) &&
          t.astNodesAreEquivalent(a as any, b as any)
        )
      } else {
        return shallowEqual(a, b)
      }
    }
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
