import j, { ASTNode } from 'jscodeshift'
import * as t from 'ast-types'
import convertToIdentifier from './Identifier'

export default function convertFlowTypeReplacement(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  if (!t.namedTypes.FlowType.check(node)) {
    const id = convertToIdentifier(node)
    if (id) return j.genericTypeAnnotation(id, null)
  }
  return node
}
