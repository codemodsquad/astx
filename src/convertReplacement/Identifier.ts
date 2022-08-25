import { Node, Identifier } from '../types'
import * as t from '@babel/types'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToIdentifier(node: Node): Identifier | void {
  const name = convertToIdentifierName(node)
  if (name) return t.identifier(name)
}
