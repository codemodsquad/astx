import j, { ASTNode } from 'jscodeshift'
import { ReplacementConverter } from './'
import convertToIdentifierPair from './convertToIdentifierPair'
import convertToIdentifier from './Identifier'

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
                ? j.importDefaultSpecifier(value)
                : j.importSpecifier(key, value)
            )
          }
        }
        return result
      }
    }
    const identifier = convertToIdentifier(node)
    if (identifier) {
      return j.importDefaultSpecifier(identifier)
    }
    const keyValue = convertToIdentifierPair(node)
    if (keyValue) {
      const [key, value] = keyValue
      return key.name === 'default'
        ? j.importDefaultSpecifier(value)
        : j.importSpecifier(key, value)
    }
    return node
  }
  return convert
}
