import j, { ASTNode } from 'jscodeshift'
import convertToIdentifier from './Identifier'
import { ReplacementConverter } from './index'

export default function convertToTypeParameter(): ReplacementConverter {
  return (node: ASTNode): ASTNode => {
    if (node.type !== 'TypeParameter') {
      const id = convertToIdentifier(node)
      if (id) return j.typeParemeter(id)
    }
    return node
  }
}
