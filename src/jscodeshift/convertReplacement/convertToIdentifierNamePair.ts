import { ASTNode } from 'jscodeshift'
import convertToJSXIdentifierNamePair from './convertToJSXIdentifierNamePair'

export default function convertToIdentifierNamePair(
  node: ASTNode
): [string, string] | void {
  const result = convertToJSXIdentifierNamePair(node)
  if (result && result[0].indexOf('-') < 0 && result[1].indexOf('-') < 0)
    return result
}
