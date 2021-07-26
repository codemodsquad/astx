import j, { ASTNode, Identifier } from 'jscodeshift'
import convertToJSXIdentifierNamePair from './convertToJSXIdentifierNamePair'

export default function convertToIdentifierPair(
  node: ASTNode
): [Identifier, Identifier] | void {
  const result = convertToJSXIdentifierNamePair(node)
  if (result && result[0].indexOf('-') < 0 && result[1].indexOf('-') < 0)
    return [j.identifier(result[0]), j.identifier(result[1])]
}
