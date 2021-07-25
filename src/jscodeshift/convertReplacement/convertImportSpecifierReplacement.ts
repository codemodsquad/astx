import { ASTNode } from '../variant'
import { ReplacementConverter } from './'
import convertToIdentifierPair from './convertToIdentifierPair'
import convertToIdentifier from './Identifier'
import { t } from '../variant'

export default function convertImportSpecifierReplacement(): ReplacementConverter {
  const convert = (node: ASTNode): ASTNode | ASTNode[] => {
    switch (node.type) {
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
      case 'ImportSpecifier':
        return node
      case 'ObjectExpression':
      case 'ObjectPattern':
      case 'ObjectTypeAnnotation':
      case 'TSTypeLiteral': {
        const result: ASTNode[] = []
        for (const prop of node.type === 'TSTypeLiteral'
          ? node.members
          : node.properties) {
          const keyValue = convertToIdentifierPair(prop)
          if (keyValue) {
            const [key, value] = keyValue
            result.push(
              key.name === 'default'
                ? t.importDefaultSpecifier(value)
                : t.importSpecifier(key, value)
            )
          }
        }
        return result
      }
    }
    const identifier = convertToIdentifier(node)
    if (identifier) {
      return t.importDefaultSpecifier(identifier)
    }
    const keyValue = convertToIdentifierPair(node)
    if (keyValue) {
      const [key, value] = keyValue
      return key.name === 'default'
        ? t.importDefaultSpecifier(value)
        : t.importSpecifier(key, value)
    }
    return node
  }
  return convert
}
