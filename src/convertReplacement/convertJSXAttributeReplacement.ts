import { Node } from '../types'
import * as t from '@babel/types'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'
import { ReplacementConverter } from '.'

export default function convertJSXAttributeReplacement(): ReplacementConverter {
  const convert = (node: Node): Node | Node[] => {
    const converted = convertToJSXIdentifierNameExpressionPair(node)
    if (converted) {
      const [name, value] = converted
      return t.jsxAttribute(
        t.jsxIdentifier(name),
        t.jsxExpressionContainer(value as any)
      )
    }
    return node
  }
  return convert
}
