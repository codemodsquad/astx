import { ASTNode } from '../variant'
import convertToIdentifier from './Identifier'
import { t, isTSType } from '../variant'

export default function convertTSTypeReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  if (!isTSType(node)) {
    const id = convertToIdentifier(node)
    if (id) return t.tsTypeReference(id, null)
  }
  return node
}
