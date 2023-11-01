import { Node, ClassDeclaration } from '../types'
import * as t from '@babel/types'

import convertToExpression from './convertToExpression'

export default function convertStatementReplacement(value: Node): Node {
  switch (value.type) {
    case 'ClassExpression':
      return { ...value, type: 'ClassDeclaration' } as any as ClassDeclaration
    case 'FunctionExpression':
      return {
        ...value,
        id: value.id || t.identifier('anonymous'),
        type: 'FunctionDeclaration',
      } as any
  }
  // @ts-expect-error @babel/types and ast-types aren't compatible atm
  if (!t.isStatement(value)) {
    const expression = convertToExpression(value)
    if (expression) return t.expressionStatement(expression as t.Expression)
  }
  return value
}
