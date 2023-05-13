import { Node, NodePath } from '../types'
import * as AstTypes from 'ast-types'
import { original } from './symbols'

export default function detectChangedNodes(
  t: typeof AstTypes,
  path: NodePath<Node>
): void {
  if (!t.namedTypes.Node.check(path.value)) return
  for (const field of t.getFieldNames(path.value)) {
    if (field === 'type') continue
    const child = path.get(field)
    if (t.namedTypes.Node.check(child.value)) {
      detectChangedNodes(t, child)
    } else if (Array.isArray(child.value)) {
      for (let i = 0; i < child.value.length; i++) {
        const elem = child.get(i)
        if (t.namedTypes.Node.check(elem.value)) {
          detectChangedNodes(t, elem)
        }
      }
    }
  }
  const orig = (path.value as any)[original]
  if (orig && !t.astNodesAreEquivalent(path.value, orig)) {
    let parent: NodePath | null = path
    while (parent) {
      if (parent.value) delete (parent.value as any)[original]
      parent = parent.parent
    }
  }
}
