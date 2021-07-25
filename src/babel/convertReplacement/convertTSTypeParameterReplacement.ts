import { ASTNode } from '../variant'
import convertToIdentifier from './Identifier'
import { ReplacementConverter } from './index'
import { t } from '../variant'

export default function convertToTSTypeParameter(): ReplacementConverter {
  return (node: ASTNode): ASTNode => {
    if (node.type !== 'TSTypeParameter') {
      const id = convertToIdentifier(node)
      if (id) return t.tsTypeParameter(id)
    }
    return node
  }
}
