import { ASTNode, Expression } from '../variant'
import convertToIdentifierName from './convertToIdentifierName'
import { t, isExpression } from '../variant'

export default function convertToExpression(value: ASTNode): Expression | void {
  switch (value.type) {
    case 'ClassDeclaration':
      return { ...value, type: 'ClassExpression' }
    case 'FunctionDeclaration':
      return { ...value, type: 'FunctionExpression' }
    case 'ExpressionStatement':
    case 'JSXExpressionContainer':
      return value.expression
    case 'JSXEmptyExpression':
      return
  }
  if (isExpression(value)) return value
  const name = convertToIdentifierName(value)
  if (name) return t.identifier(name)
}
