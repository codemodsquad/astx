import { ASTPath, ASTNode } from 'jscodeshift'
import { NodeType } from './compileMatcher'
import { visit, Visitor } from 'ast-types'

export function forEachNode(
  paths: ASTPath[],
  nodeTypes: NodeType[],
  iteratee: (node: ASTNode) => void
): void {
  function visitNode(this: any, path: ASTPath) {
    iteratee(path)
    this.traverse(path)
  }
  const visitor: Visitor<any> = {}
  for (const nodeType of nodeTypes) {
    ;(visitor as any)[`visit${nodeType}`] = visitNode
  }

  paths.forEach((path: ASTPath) => visit(path, visitor))
}
