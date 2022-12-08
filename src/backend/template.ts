/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Backend } from './Backend'
import { Node, Expression, Statement } from '../types'
import compileReplacement from '../compileReplacement'
import convertToExpression from '../convertReplacement/convertToExpression'
import convertStatementReplacement from '../convertReplacement/convertStatementReplacement'
import ensureArray from '../util/ensureArray'
import Astx from '../Astx'
import CodeFrameError from '../util/CodeFrameError'
import { getArrayPlaceholder } from '../compileMatcher/Placeholder'

function convertQuasis(nodes: any[]): {
  captures: Record<string, Node>
  arrayCaptures: Record<string, Node[]>
  varNames: string[]
} {
  const captures: Record<string, Node> = {}
  const arrayCaptures: Record<string, Node[]> = {}
  const varNames: string[] = []
  for (let i = 0; i < nodes.length; i++) {
    let replacement: string | Node | Node[] | undefined
    if (typeof nodes[i] === 'string') {
      replacement = nodes[i]
    } else if (Array.isArray(nodes[i])) {
      replacement = nodes[i]
        .map((n: any) => (n instanceof Astx ? n.nodes : n))
        .flat()
    } else if (nodes[i] instanceof Astx) {
      const astx = nodes[i]
      if (
        astx.size > 1 ||
        (astx.placeholder && getArrayPlaceholder(astx.placeholder))
      ) {
        replacement = astx.nodes
      } else {
        replacement = astx.nodes[0]
      }
    } else if (nodes[i]) {
      replacement = nodes[i]
    }

    if (typeof replacement === 'string') {
      varNames.push(replacement)
    } else if (Array.isArray(replacement)) {
      const name = `$$tpl___${i}`
      arrayCaptures[name] = replacement
      varNames.push(name)
    } else {
      const name = `$tpl___${i}`
      if (replacement) captures[name] = replacement
      varNames.push(name)
    }
  }
  return { captures, arrayCaptures, varNames }
}

export function statements(
  this: Backend,
  code: TemplateStringsArray | string[] | string,
  ...nodes: any[]
): Statement[] {
  const { captures, arrayCaptures, varNames } = convertQuasis(nodes)

  const src = ([...ensureArray(code)] as string[]).reduce(
    (result: string, elem: string, i: number) => result + varNames[i - 1] + elem
  )
  try {
    if (!nodes.length || nodes.every((n) => typeof n === 'string'))
      return this.parseStatements(src)
    const result = compileReplacement(
      this.parseStatements(src).map((n) => new this.t.NodePath(n)),
      {
        backend: this,
      }
    ).generate({ captures, arrayCaptures })
    return ensureArray(result).map(convertStatementReplacement) as Statement[]
  } catch (error) {
    if (error instanceof Error) {
      CodeFrameError.rethrow(error, { filename: 'statements', source: src })
    }
    throw error
  }
}

export function statement(
  this: Backend,
  template: TemplateStringsArray | string[] | string,
  ...nodes: any[]
): Statement {
  const result = this.template.statements(template, ...nodes)
  if (result.length !== 1) {
    throw new Error(`code is not a statement`)
  }
  return result[0]
}

export function expression(
  this: Backend,
  code: TemplateStringsArray | string[] | string,
  ...nodes: any[]
): Expression {
  const { captures, arrayCaptures, varNames } = convertQuasis(nodes)

  const src = ([...ensureArray(code)] as string[]).reduce(
    (result: string, elem: string, i: number) => result + varNames[i - 1] + elem
  )
  try {
    if (!nodes.length || nodes.every((n) => typeof n === 'string'))
      return this.parseExpression(src)
    const result = compileReplacement(
      new this.t.NodePath(this.parseExpression(src)),
      {
        backend: this,
      }
    ).generate({ captures, arrayCaptures })
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
  } catch (error) {
    if (error instanceof Error) {
      CodeFrameError.rethrow(error, { filename: 'expression', source: src })
    }
    throw error
  }
}
