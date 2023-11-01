import { Node, Expression } from '../types'
import * as t from '@babel/types'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToExpression(value: Node): Expression | void {
  switch (value.type) {
    case 'ClassDeclaration':
      return { ...value, type: 'ClassExpression' }
    case 'FunctionDeclaration':
      return { ...value, type: 'FunctionExpression' }
    case 'ExpressionStatement':
    case 'JSXExpressionContainer':
      if (value.expression?.type !== 'JSXEmptyExpression')
        return value.expression
  }
  // @ts-expect-error @babel/types and ast-types aren't compatible atm
  if (t.isExpression(value)) return value
  const name = convertToIdentifierName(value)
  if (name) return t.identifier(name)
}
