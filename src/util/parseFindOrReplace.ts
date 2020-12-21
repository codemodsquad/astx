import { Expression, JSCodeshift, Statement } from 'jscodeshift'
import template from './template'

export default function parseFindOrReplace(
  j: JSCodeshift,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement {
  const { expression, statement } = template(j)
  try {
    return expression(strings, ...quasis)
  } catch (error) {
    // ignore
  }

  return statement(strings, ...quasis)
}
