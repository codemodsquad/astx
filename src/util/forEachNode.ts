import * as AstTypes from 'ast-types'
import { NodeType, NodePath } from '../types'

AstTypes.PathVisitor

export default function forEachNode(
  t: typeof AstTypes,
  paths: readonly NodePath[],
  nodeTypes: readonly NodeType[],
  iteratee: (path: NodePath) => void
): void {
  const visited = new Set()
  function visitNode(this: any, path: NodePath) {
    if (visited.has(path.node)) return false
    visited.add(path.node)
    iteratee(path)
    this.traverse(path)
  }
  const visitor: AstTypes.Visitor = {}
  for (const nodeType of nodeTypes) {
    ;(visitor as any)[`visit${nodeType}`] = visitNode
  }
  const pathVisitor = t.PathVisitor.fromMethodsObject(visitor)
  paths.forEach((path: NodePath) => {
    pathVisitor.visitWithoutReset(path)
  })
}
