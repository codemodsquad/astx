import j, { ASTNode, ClassDeclaration } from 'jscodeshift'
import * as t from 'ast-types'

import convertToExpression from './convertToExpression'

export default function convertStatementReplacement(value: ASTNode): ASTNode {
  switch (value.type) {
    case 'ClassExpression':
      return { ...value, type: 'ClassDeclaration' } as ClassDeclaration
    case 'FunctionExpression':
      return {
        ...value,
        id: value.id || j.identifier('anonymous'),
        type: 'FunctionDeclaration',
      }
  }
  if (!t.namedTypes.Statement.check(value)) {
    const expression = convertToExpression(value)
    if (expression) return j.expressionStatement(expression as any)
  }
  return value
}
