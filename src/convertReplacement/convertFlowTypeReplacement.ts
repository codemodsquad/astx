import { ASTNode } from '../variant'
import convertToIdentifier from './Identifier'
import { t, isFlowType } from '../variant'

export default function convertFlowTypeReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  if (!isFlowType(node)) {
    const id = convertToIdentifier(node)
    if (id) return t.genericTypeAnnotation(id, null)
  }
  return node
}
