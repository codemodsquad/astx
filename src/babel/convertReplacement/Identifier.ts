import { ASTNode, Identifier } from '../variant'
import convertToIdentifierName from './convertToIdentifierName'
import { t } from '../variant'

export default function convertToIdentifier(node: ASTNode): Identifier | void {
  const name = convertToIdentifierName(node)
  if (name) return t.identifier(name)
}
