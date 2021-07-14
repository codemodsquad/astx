import { ASTNode, Identifier } from '../variant'
import convertToJSXIdentifierNamePair from './convertToJSXIdentifierNamePair'
import { t } from '../variant'

export default function convertToIdentifierPair(
  node: ASTNode
): [Identifier, Identifier] | void {
  const result = convertToJSXIdentifierNamePair(node)
  if (result && result[0].indexOf('-') < 0 && result[1].indexOf('-') < 0)
    return [t.identifier(result[0]), t.identifier(result[1])]
}
