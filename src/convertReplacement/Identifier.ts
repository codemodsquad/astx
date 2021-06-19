import j, { ASTNode, Identifier } from 'jscodeshift'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToIdentifier(node: ASTNode): Identifier | void {
  const name = convertToIdentifierName(node)
  if (name) return j.identifier(name)
}
