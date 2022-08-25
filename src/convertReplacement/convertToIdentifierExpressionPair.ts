import { Node, Identifier, Expression } from '../types'
import * as t from '@babel/types'
import convertToJSXIdentifierNameExpressionPair from './convertToJSXIdentifierNameExpressionPair'

export default function convertToIdentifierExpressionPair(
  node: Node
): [Identifier, Expression] | void {
  const result = convertToJSXIdentifierNameExpressionPair(node)
  if (result && result[0].indexOf('-') < 0)
    return [t.identifier(result[0]), result[1]]
}
