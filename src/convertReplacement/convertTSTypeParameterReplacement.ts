import j, { ASTNode } from 'jscodeshift'
import convertToIdentifier from './Identifier'
import { ReplacementConverter } from './index'

export default function convertToTSTypeParameter(): ReplacementConverter {
  return (node: ASTNode): ASTNode => {
    if (node.type !== 'TSTypeParameter') {
      const id = convertToIdentifier(node)
      if (id) return j.tsTypeParemeter(id)
    }
    return node
  }
}
