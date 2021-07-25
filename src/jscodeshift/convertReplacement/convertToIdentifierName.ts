import { ASTNode } from '../variant'
import convertToJSXIdentifierName from './convertToJSXIdentifierName'

export default function convertToIdentifierName(node: ASTNode): string | void {
  const name = convertToJSXIdentifierName(node)
  return name && name.indexOf('-') < 0 ? name : undefined
}
