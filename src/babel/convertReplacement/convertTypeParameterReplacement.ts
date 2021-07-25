import { ASTNode } from '../variant'
import convertToIdentifier from './Identifier'
import { ReplacementConverter } from './index'
import { t } from '../variant'

export default function convertToTypeParameter(): ReplacementConverter {
  return (node: ASTNode): ASTNode => {
    if (node.type !== 'TypeParameter') {
      const id = convertToIdentifier(node)
      if (id) return t.typeParemeter(id)
    }
    return node
  }
}
