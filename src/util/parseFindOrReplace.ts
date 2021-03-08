import { Expression, JSCodeshift, Statement } from 'jscodeshift'
import template from './template'

export default function parseFindOrReplace(
  j: JSCodeshift,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
  const { expression, statements } = template(j)
  try {
    return expression(strings, ...quasis)
  } catch (error) {
    // ignore
  }

  const result = statements(strings, ...quasis)
  return result.length === 1 ? result[0] : result
}
