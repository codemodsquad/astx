import j, { ASTNode, Expression } from 'jscodeshift'
import * as t from 'ast-types'
import convertToIdentifierName from './convertToIdentifierName'

export default function convertToExpression(value: ASTNode): Expression | void {
  switch (value.type) {
    case 'ClassDeclaration':
      return { ...value, type: 'ClassExpression' }
    case 'FunctionDeclaration':
      return { ...value, type: 'FunctionExpression' }
    case 'ExpressionStatement':
    case 'JSXExpressionContainer':
      return value.expression
  }
  if (t.namedTypes.Expression.check(value)) return value
  const name = convertToIdentifierName(value)
  if (name) return j.identifier(name)
}
