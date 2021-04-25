import {
  Expression,
  ExpressionStatement,
  JSCodeshift,
  Statement,
} from 'jscodeshift'
import template from './template'

export default function parseFindOrReplace(
  j: JSCodeshift,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
  const { expression, statements } = template(j)
  try {
    const result = statements(strings, ...quasis)
    if (result.length === 1) {
      if (result[0].type === 'ExpressionStatement')
        return (result[0] as ExpressionStatement).expression
      return result[0]
    }
    if (result.length) return result
  } catch (error) {
    // fallthrough
  }
  return expression(strings, ...quasis)
}
