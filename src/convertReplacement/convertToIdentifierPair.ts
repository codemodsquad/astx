import { Node, Identifier } from '../types'
import * as t from '@babel/types'
import convertToJSXIdentifierNamePair from './convertToJSXIdentifierNamePair'

export default function convertToIdentifierPair(
  node: Node
): [Identifier, Identifier] | void {
  const result = convertToJSXIdentifierNamePair(node)
  if (result && result[0].indexOf('-') < 0 && result[1].indexOf('-') < 0)
    return [t.identifier(result[0]), t.identifier(result[1])]
}
