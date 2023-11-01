import { Node } from '../types'
import * as t from '@babel/types'
import convertToIdentifier from './Identifier'

export default function convertFlowTypeReplacement(node: Node): Node {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  // @ts-expect-error @babel/types and ast-types aren't compatible atm
  if (!t.isFlowType(node)) {
    const id = convertToIdentifier(node)
    if (id) return t.genericTypeAnnotation(id as any, null)
  }
  return node
}
