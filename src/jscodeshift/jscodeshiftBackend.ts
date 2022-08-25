import { Node, NodeType, NodePath, Statement } from '../types'
import { Backend } from '../Backend'
import areASTsEqual, { areFieldValuesEqual } from './util/areASTsEqual'
import getFieldNames from './util/getFieldNames'
import { visit, Visitor } from 'ast-types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import JSCodeshiftNodePath from './JSCodeshiftNodePath'
import * as recast from 'recast'
import * as t from 'ast-types'
import defaultJSCodeshift, { JSCodeshift } from 'jscodeshift'

export default function jscodeshiftBackend(
  j: JSCodeshift = defaultJSCodeshift
): Backend {
  return {
    parse: (code: string) => j(code).get().node,
    generate: (node: Node) => recast.print(node),
    rootPath: (node: Node) => JSCodeshiftNodePath.wrap(j([node]).get()),
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
        iteratee(JSCodeshiftNodePath.wrap(path))
        this.traverse(path)
      }
      const visitor: Visitor<any> = {}
      for (const nodeType of nodeTypes) {
        ;(visitor as any)[`visit${nodeType}`] = visitNode
      }

      paths.forEach((path: NodePath) => visit(path.node, visitor))
    },
    isTypeFns: Object.fromEntries(
      [...Object.entries(t.namedTypes)].map(([key, value]) => [
        key,
        (node: any) => value.check(node),
      ])
    ),
  }
}
