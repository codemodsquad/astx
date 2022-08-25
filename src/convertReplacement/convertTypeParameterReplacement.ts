import { Node } from '../types'
import * as t from '@babel/types'
import { ReplacementConverter } from './index'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToTypeParameter(): ReplacementConverter {
  return (node: Node): Node => {
    if (node.type !== 'TypeParameter') {
      const id = convertToIdentifierName(node)
      if (id) {
        const param = t.typeParameter()
        param.name = id
        return param
      }
    }
    return node
  }
}
