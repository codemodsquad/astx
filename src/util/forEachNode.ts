import * as AstTypes from 'ast-types'
import { NodeType, NodePath } from '../types'

export default function forEachNode(
  t: typeof AstTypes,
  paths: readonly NodePath[],
  nodeTypes: readonly NodeType[],
  iteratee: (path: NodePath) => void
): void {
  const visited = new Set()
  function visitNode(this: any, path: NodePath) {
    if (visited.has(path.node)) return
    visited.add(path.node)
    iteratee(path)
    this.traverse(path)
  }
  const visitor: AstTypes.Visitor = {}
  for (const nodeType of nodeTypes) {
    ;(visitor as any)[`visit${nodeType}`] = visitNode
  }
  paths.forEach((path: NodePath) => {
    t.visit(path.node, visitor)
  })
}
