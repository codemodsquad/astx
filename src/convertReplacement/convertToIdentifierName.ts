import { Node } from '../types'
import convertToJSXIdentifierName from './convertToJSXIdentifierName'

export default function convertToIdentifierName(node: Node): string | void {
  const name = convertToJSXIdentifierName(node)
  return name && name.indexOf('-') < 0 ? name : undefined
}
