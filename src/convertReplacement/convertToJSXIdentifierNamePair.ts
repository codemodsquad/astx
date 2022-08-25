import { Node } from '../types'
import convertToJSXIdentifierName from './convertToIdentifierName'

export default function convertToJSXIdentifierNamePair(
  node: Node
): [string, string] | void {
  switch (node.type) {
    case 'ObjectProperty':
    case 'ObjectTypeProperty':
    case 'Property': {
      const key = convertToJSXIdentifierName(node.key)
      const value = convertToJSXIdentifierName(node.value)
      if (key && value) return [key, value]
      break
    }
    case 'TSPropertySignature': {
      const key = convertToJSXIdentifierName(node.key)
      const value = node.typeAnnotation
        ? convertToJSXIdentifierName(node.typeAnnotation)
        : key
      if (key && value) return [key, value]
      break
    }
    case 'JSXAttribute': {
      const key = convertToJSXIdentifierName(node.name)
      const value = node.value ? convertToJSXIdentifierName(node.value) : key
      if (key && value) return [key, value]
      break
    }
    case 'ImportSpecifier': {
      const key = node.imported.name
      const value = node.local?.name || key
      return [key, value]
    }
    case 'ImportDefaultSpecifier': {
      const value = node.local?.name || 'default'
      return ['default', value]
    }
  }
  const key = convertToJSXIdentifierName(node)
  if (key) return [key, key]
}
