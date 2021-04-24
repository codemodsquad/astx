import { ASTNode } from 'jscodeshift'

function isValidIdentifier(s: string) {
  return /^[_$a-z][_$a-z0-9]*$/i.test(s)
}

export default function getIdentifierish(node: ASTNode): string | void {
  switch (node.type) {
    case 'ExpressionStatement':
      return getIdentifierish(node.expression)
    case 'Identifier':
    case 'JSXIdentifier':
      return node.name
    case 'JSXExpressionContainer':
      return getIdentifierish(node.expression)
    case 'StringLiteral':
    case 'Literal':
      if (isValidIdentifier(String(node.value))) return String(node.value)
      break
    case 'TemplateLiteral':
      if (
        node.quasis.length === 1 &&
        isValidIdentifier(node.quasis[0].value.cooked)
      ) {
        return node.quasis[0].value.cooked
      }
      break
    case 'TypeAnnotation':
    case 'TSTypeAnnotation':
      return getIdentifierish(node.typeAnnotation)
    case 'GenericTypeAnnotation':
      if (node.id.type !== 'Identifier' || node.typeParameters) return
      return node.id.name
    case 'TSTypeReference':
      if (node.typeName.type !== 'Identifier' || node.typeParameters) return
      return node.typeName.name
    case 'ImportDefaultSpecifier':
      return node.local?.name
    case 'ImportSpecifier':
      if (node.imported?.name !== node.local?.name) return
      return node.local?.name
    case 'TypeParameter':
    case 'TSTypeParameter':
      return node.name
    case 'ClassImplements':
    case 'InterfaceExtends':
      return getIdentifierish(node.id)
    case 'MixedTypeAnnotation':
      return 'mixed'
    case 'TSUnknownKeyword':
      return 'unknown'
    case 'AnyTypeAnnotation':
    case 'TSAnyKeyword':
      return 'any'
    case 'StringTypeAnnotation':
    case 'TSStringKeyword':
      return 'string'
    case 'NumberTypeAnnotation':
    case 'TSNumberKeyword':
      return 'number'
    case 'BooleanTypeAnnotation':
    case 'TSBooleanKeyword':
      return 'boolean'
    case 'TSSymbolKeyword':
      return 'symbol'
  }
}
