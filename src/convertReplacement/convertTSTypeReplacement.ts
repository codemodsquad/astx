import j, { ASTNode } from 'jscodeshift'
import t from 'ast-types'
import convertToIdentifier from './Identifier'

export default function convertTSTypeReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  if (!t.namedTypes.TSType.check(node)) {
    const id = convertToIdentifier(node)
    if (id) return j.tsTypeReference(id, null)
  }
  return node
}
