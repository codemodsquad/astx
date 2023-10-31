import { Comment, Node, NodePath } from '../types'
import * as AstTypes from 'ast-types'
import { original } from './symbols'

function getFieldNames(t: typeof AstTypes, node: Node | Comment): string[] {
  switch (node.type) {
    case 'File':
    case 'Program':
    case 'CommentBlock':
    case 'CommentLine':
      return t.getFieldNames(node)
  }
  return [
    ...t.getFieldNames(node),
    'leadingComments',
    'innerComments',
    'trailingComments',
  ]
}

export default function detectChangedNodes(
  t: typeof AstTypes,
  path: NodePath<Node>
): void {
  const isNode = t.namedTypes.Node.check(path.value)
  if (isNode) {
    for (const field of getFieldNames(t, path.value as Node)) {
      if (field === 'type') continue
      const child = path.get(field)
      if (t.namedTypes.Node.check(child.value)) {
        detectChangedNodes(t, child)
      } else if (Array.isArray(child.value)) {
        for (let i = 0; i < child.value.length; i++) {
          const elem = child.get(i)
          if (
            t.namedTypes.Node.check(elem.value) ||
            t.namedTypes.Comment.check(child.value)
          ) {
            detectChangedNodes(t, elem)
          }
        }
      }
    }
  } else if (!t.namedTypes.Comment.check(path.value)) {
    return
  }
  const orig = (path.value as any)[original]
  if (
    orig &&
    (!t.astNodesAreEquivalent(path.value, orig) ||
      (isNode && !nodesHaveEquivalentComments(t, path.value, orig)))
  ) {
    let parent: NodePath<Node> | NodePath<Comment> | null = path
    while (parent) {
      if (parent.value) delete (parent.value as any)[original]
      parent = parent.parent
    }
  }
}

function nodesHaveEquivalentComments(
  t: typeof AstTypes,
  a: any,
  b: any
): boolean {
  for (const key of ['leadingComments', 'innerComments', 'trailingComments']) {
    const aComments = a[key]
    const bComments = b[key]
    if (aComments === bComments) continue
    if (
      !Array.isArray(aComments) ||
      !Array.isArray(bComments) ||
      aComments.length !== bComments.length ||
      !aComments.every(
        (comment, index) =>
          bComments[index] && t.astNodesAreEquivalent(comment, bComments[index])
      )
    ) {
      return false
    }
  }
  return true
}
