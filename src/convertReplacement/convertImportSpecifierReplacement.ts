import { Node } from '../types'
import * as t from '@babel/types'
import { ReplacementConverter } from './'
import convertToIdentifierPair from './convertToIdentifierPair'

export default function convertImportSpecifierReplacement(): ReplacementConverter {
  const convert = (node: Node): Node | Node[] => {
    switch (node.type) {
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
      case 'ImportSpecifier':
        return node
      case 'ObjectExpression':
      case 'ObjectPattern':
      case 'ObjectTypeAnnotation':
      case 'TSTypeLiteral': {
        const result: Node[] = []
        for (const prop of node.type === 'TSTypeLiteral'
          ? node.members
          : node.properties) {
          const keyValue = convertToIdentifierPair(prop)
          if (keyValue) {
            const [key, value] = keyValue
            result.push(
              key.name === 'default'
                ? t.importDefaultSpecifier(value as t.Identifier)
                : t.importSpecifier(value as t.Identifier, key as t.Identifier)
            )
          }
        }
        return result
      }
    }
    if (node.type === 'Identifier') {
      return t.importDefaultSpecifier(node as t.Identifier)
    }
    const keyValue = convertToIdentifierPair(node)
    if (keyValue) {
      const [key, value] = keyValue
      return key.name === 'default'
        ? t.importDefaultSpecifier(value as t.Identifier)
        : t.importSpecifier(value as t.Identifier, key as t.Identifier)
    }
    return node
  }
  return convert
}
