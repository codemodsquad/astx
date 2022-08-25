import { Node } from '../types'
import * as t from '@babel/types'
import convertToIdentifier from './Identifier'

export default function convertTSTypeReplacement(node: Node): Node {
  switch (node.type) {
    case 'TypeAnnotation':
      return node.typeAnnotation
  }
  if (!t.isTSType(node)) {
    const id = convertToIdentifier(node)
    if (id) return t.tsTypeReference(id as t.Identifier, null)
  }
  return node
}
