import { ASTNode, ClassDeclaration } from '../variant'
import convertToExpression from './convertToExpression'
import { isStatement, t } from '../variant'

export default function convertStatementReplacement(value: ASTNode): ASTNode {
  switch (value.type) {
    case 'ClassExpression':
      return { ...value, type: 'ClassDeclaration' } as ClassDeclaration
    case 'FunctionExpression':
      return {
        ...value,
        id: value.id || t.identifier('anonymous'),
        type: 'FunctionDeclaration',
      }
  }
  if (!isStatement(value)) {
    const expression = convertToExpression(value)
    if (expression) return t.expressionStatement(expression as any)
  }
  return value
}
