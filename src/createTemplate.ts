/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Backend } from './Backend'
import { Node, Expression, Statement } from './types'
import compileReplacement from './compileReplacement'
import convertToExpression from './convertReplacement/convertToExpression'
import convertStatementReplacement from './convertReplacement/convertStatementReplacement'

export default function createTemplate(
  backend: Backend
): {
  statements: (
    code: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ) => Statement[]
  statement: (
    code: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ) => Statement
  expression: (
    code: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ) => Expression
} {
  const { parseStatements, parseExpression, makePath } = backend
  function statements(
    code: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ): Statement[] {
    const captures: Record<string, Node> = {}
    const arrayCaptures: Record<string, Node[]> = {}
    const varNames: string[] = []
    for (let i = 0; i < nodes.length; i++) {
      if (typeof nodes[i] === 'string') {
        varNames.push(nodes[i])
      }
      if (Array.isArray(nodes[i])) {
        const name = `$$tpl___${i}`
        arrayCaptures[name] = nodes[i]
        varNames.push(name)
      } else {
        const name = `$tpl___${i}`
        captures[name] = nodes[i]
        varNames.push(name)
      }
    }
    const src = (Array.isArray(code) ? [...code] : ([code] as string[])).reduce(
      (result: string, elem: string, i: number) =>
        result + varNames[i - 1] + elem
    )
    if (!nodes.length || nodes.every((n) => typeof n === 'string'))
      return parseStatements(src)
    const result = compileReplacement(parseStatements(src).map(makePath), {
      backend,
    }).generate({ captures, arrayCaptures })
    const result1 = Array.isArray(result) ? result : [result]
    return result1.map(convertStatementReplacement) as Statement[]
  }

  function statement(
    template: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ): Statement {
    return statements(template, ...nodes)[0]
  }

  function expression(
    code: TemplateStringsArray | string[] | string,
    ...nodes: any[]
  ): Expression {
    const captures: Record<string, Node> = {}
    const arrayCaptures: Record<string, Node[]> = {}
    const varNames: string[] = []
    for (let i = 0; i < nodes.length; i++) {
      if (typeof nodes[i] === 'string') {
        varNames.push(nodes[i])
      }
      if (Array.isArray(nodes[i])) {
        const name = `$$tpl___${i}`
        arrayCaptures[name] = nodes[i]
        varNames.push(name)
      } else {
        const name = `$tpl___${i}`
        captures[name] = nodes[i]
        varNames.push(name)
      }
    }
    const src = (Array.isArray(code) ? [...code] : ([code] as string[])).reduce(
      (result: string, elem: string, i: number) =>
        result + varNames[i - 1] + elem
    )
    if (!nodes.length || nodes.every((n) => typeof n === 'string'))
      return parseExpression(src)
    const result = compileReplacement(makePath(parseExpression(src)), {
      backend,
    }).generate({ captures, arrayCaptures })
    let expression
    if (Array.isArray(result)) {
      if (result.length !== 1) {
        throw new Error(`code is not an expression: ${src}`)
      }
      expression = convertToExpression(result[0])
    } else {
      expression = convertToExpression(result)
    }
    if (!expression) {
      throw new Error(`code is not an expression: ${src}`)
    }
    return expression
  }

  return { statements, statement, expression }
}
