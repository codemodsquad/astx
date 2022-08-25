import { Node, Expression } from '../types'
import * as t from '@babel/types'
import convertToJSXIdentifierName from './convertToIdentifierName'
import convertToExpression from './convertToExpression'

export default function convertToJSXIdentifierNameExpressionPair(
  node: Node
): [string, Expression] | void {
  switch (node.type) {
    case 'ObjectProperty':
    case 'ObjectTypeProperty':
    case 'Property': {
      const key = convertToJSXIdentifierName(node.key)
      const value = convertToExpression(node.value)
      if (key && value) return [key, value]
      break
    }
    case 'TSPropertySignature': {
      const key = convertToJSXIdentifierName(node.key)
      const value = convertToExpression(node.typeAnnotation || node.key)
      if (key && value) return [key, value]
      break
    }
    case 'JSXAttribute': {
      const key = convertToJSXIdentifierName(node.name)
      const value = convertToExpression(node.value || node.name)
      if (key && value) return [key, value]
      break
    }
    case 'ImportSpecifier': {
      const key = node.imported.name
      const value = node.local || node.imported
      return [key, value]
    }
    case 'ImportDefaultSpecifier': {
      const value = node.local || t.identifier('default')
      return ['default', value]
    }
  }
  const key = convertToJSXIdentifierName(node)
  if (key) return [key, t.identifier(key)]
}
