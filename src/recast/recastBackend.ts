import { Node, NodeType, NodePath, Statement } from '../types'
import { Backend } from '../Backend'
import areASTsEqual, { areFieldValuesEqual } from './util/areASTsEqual'
import getFieldNames from './util/getFieldNames'
import { visit, Visitor } from 'ast-types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import JSCodeshiftNodePath from './RecastNodePath'
import * as defaultRecast from 'recast'
import * as t from 'ast-types'
import RecastNodePath from './RecastNodePath'
import withParser from './util/template'

export default function recastBackend({
  recast = defaultRecast,
  parseOptions,
}: {
  recast?: typeof defaultRecast
  parseOptions?: defaultRecast.Options
}): Backend {
  const template = withParser(recast, parseOptions)
  return {
    parse: (code: string) => recast.parse(code, parseOptions),
    generate: (node: Node) => recast.print(node),
    template: {
      expression: (code: string) => template.expression([code]),
      statements: (code: string) => template.statements([code]),
      smart: (code: string) => {
        try {
          return template.expression([code])
        } catch (error) {
          let ast: t.ASTNode | t.ASTNode[] = template.statements([code])
          if (Array.isArray(ast) && ast.length === 1) {
            ast = ast[0]
          }
          return ast.type === 'ExpressionStatement' ? ast.expression : ast
        }
      },
    },
    makePath: (node: Node) => JSCodeshiftNodePath.wrap(new t.NodePath(node)),
    sourceRange: (node: Node) => [(node as any).start, (node as any).end],
    getFieldNames: (nodeType: string) =>
      getFieldNames({ type: nodeType } as any),
    defaultFieldValue: (nodeType: string, field: string) =>
      t.getFieldValue({ type: nodeType } as any, field),
    areASTsEqual,
    areFieldValuesEqual,
    isStatement: (node: any): node is Statement =>
      t.namedTypes.Statement.check(node),
    forEachNode: (
      paths: NodePath[],
      nodeTypes: NodeType[],
      iteratee: (path: NodePath) => void
    ): void => {
      function visitNode(this: any, path: ASTPath<Node>) {
        iteratee(RecastNodePath.wrap(path))
        this.traverse(path)
      }
      const visitor: Visitor<any> = {}
      for (const nodeType of nodeTypes) {
        ;(visitor as any)[`visit${nodeType}`] = visitNode
      }

      paths.forEach((path: NodePath) => visit(path.node, visitor))
    },
    traverse: (
      ast: Node,
      _visitor: { [n in NodeType]?: (path: NodePath<any>) => void }
    ) => {
      const visitor: Visitor<any> = {}
      for (const nodeType in _visitor) {
        const visitNode = function visitNode(this: any, path: ASTPath<Node>) {
          ;(_visitor as any)[nodeType](JSCodeshiftNodePath.wrap(path))
          this.traverse(path)
        }
        if (nodeType === 'Block') {
          visitor.visitProgram = visitNode
          visitor.visitBlockStatement = visitNode
          visitor.visitTSModuleBlock = visitNode
        } else {
          ;(visitor as any)[`visit${nodeType}`] = visitNode
        }
      }
      t.visit(ast, visitor)
    },
    isTypeFns: Object.fromEntries(
      [...Object.entries(t.namedTypes)].map(([key, value]) => [
        key,
        (node: any) => value.check(node),
      ])
    ),
    hasNode: <T = any>(path: NodePath<T>): path is NodePath<NonNullable<T>> =>
      t.namedTypes.Node.check(path.node),
  }
}
