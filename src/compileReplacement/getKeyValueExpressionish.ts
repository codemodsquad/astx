import j, { ASTNode, Expression } from 'jscodeshift'
import getIdentifierish from './getIdentifierish'
import getExpressionish from './getExpressionish'

export default function getKeyValueExpressionish(
  node: ASTNode
): { key: string; value: Expression } | void {
  switch (node.type) {
    case 'ObjectProperty':
    case 'Property': {
      const key = getIdentifierish(node.key)
      if (key) return { key, value: node.value }
      break
    }
    case 'TSPropertySignature': {
      if (node.initializer || !node.typeAnnotation) return
      const key = getIdentifierish(node.key)
      const value = getIdentifierish(node.typeAnnotation)
      if (key && value) return { key, value: j.identifier(value) }
      break
    }
    case 'ImportSpecifier': {
      const key = getIdentifierish(node.imported)
      const value = getIdentifierish(node.local || node.imported)
      if (key && value) return { key, value: j.identifier(value) }
      break
    }
    case 'ImportDefaultSpecifier': {
      const value = node.local ? getIdentifierish(node.local) : null
      if (value) return { key: 'default', value: j.identifier(value) }
      break
    }
    case 'JSXAttribute': {
      const key = getIdentifierish(node.name)
      const value = node.value ? getExpressionish(node.value) : null
      if (key && value) return { key, value }
      break
    }
  }
}
