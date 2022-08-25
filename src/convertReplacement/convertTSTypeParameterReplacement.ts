import { Node } from '../types'
import * as t from '@babel/types'
import { ReplacementConverter } from './index'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToTSTypeParameter(): ReplacementConverter {
  return (node: Node): Node => {
    if (node.type !== 'TSTypeParameter') {
      const id = convertToIdentifierName(node)
      if (id) return t.tsTypeParameter(null, null, id)
    }
    return node
  }
}
