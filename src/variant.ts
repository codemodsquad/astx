import jscodeshift, { ASTPath, ASTNode } from 'jscodeshift'
import { NodeType } from './compileMatcher'
import { visit, Visitor } from 'ast-types'

export function getPath<Node extends ASTNode>(node: Node): ASTPath<Node> {
  return jscodeshift([node]).paths()[0]
}

export function forEachNode(
  paths: ASTPath<any>[],
  nodeTypes: NodeType[],
  iteratee: (path: ASTPath<any>) => void
): void {
  function visitNode(this: any, path: ASTPath<any>) {
    iteratee(path)
    this.traverse(path)
  }
  const visitor: Visitor<any> = {}
  for (const nodeType of nodeTypes) {
    ;(visitor as any)[`visit${nodeType}`] = visitNode
  }

  paths.forEach((path: ASTPath<any>) => visit(path as any, visitor))
}
