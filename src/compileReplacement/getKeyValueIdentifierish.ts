import { ASTNode } from 'jscodeshift'
import getIdentifierish from './getIdentifierish'

export default function getKeyValueIdentifierish(
  node: ASTNode
): { key: string; value: string } | void {
  switch (node.type) {
    case 'ObjectProperty':
    case 'Property':
    case 'ObjectTypeProperty': {
      const key = getIdentifierish(node.key)
      const value = getIdentifierish(node.value)
      if (key && value) return { key, value }
      break
    }
    case 'TSPropertySignature': {
      if (node.initializer || !node.typeAnnotation) return
      const key = getIdentifierish(node.key)
      const value = getIdentifierish(node.typeAnnotation)
      if (key && value) return { key, value }
      break
    }
    case 'ImportSpecifier': {
      const key = getIdentifierish(node.imported)
      const value = getIdentifierish(node.local || node.imported)
      if (key && value) return { key, value }
      break
    }
    case 'ImportDefaultSpecifier': {
      const value = node.local ? getIdentifierish(node.local) : null
      if (value) return { key: 'default', value }
      break
    }
  }
}
