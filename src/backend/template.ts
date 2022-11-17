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

export function statements(
  this: Backend,
  code: TemplateStringsArray | string[] | string,
  ...nodes: any[]
): Statement[] {
  const captures: Record<string, Node> = {}
  const arrayCaptures: Record<string, Node[]> = {}
  const varNames: string[] = []
  for (let i = 0; i < nodes.length; i++) {
    if (typeof nodes[i] === 'string') {
      varNames.push(nodes[i])
    } else if (Array.isArray(nodes[i])) {
      const name = `$$tpl___${i}`
      arrayCaptures[name] = nodes[i].map((n: any) =>
        n instanceof Astx ? n.node : n
      )
      varNames.push(name)
    } else {
      if (nodes[i] instanceof Astx) {
        const astx: Astx = nodes[i]
        if (astx.size > 1) {
          const name = `$$tpl___${i}`
          arrayCaptures[name] = [...astx.nodes]
          varNames.push(name)
        } else {
          const name = `$tpl___${i}`
          captures[name] = astx.node
          varNames.push(name)
        }
      } else {
        const name = `$tpl___${i}`
        captures[name] = nodes[i]
        varNames.push(name)
      }
    }
  }
  const src = ([...ensureArray(code)] as string[]).reduce(
    (result: string, elem: string, i: number) => result + varNames[i - 1] + elem
  )
  if (!nodes.length || nodes.every((n) => typeof n === 'string'))
    return this.parseStatements(src)
  const result = compileReplacement(
    this.parseStatements(src).map((n) => new this.t.NodePath(n)),
    {
      backend: this,
    }
  ).generate({ captures, arrayCaptures })
  return ensureArray(result).map(convertStatementReplacement) as Statement[]
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
  const captures: Record<string, Node> = {}
  const arrayCaptures: Record<string, Node[]> = {}
  const varNames: string[] = []
  for (let i = 0; i < nodes.length; i++) {
    if (typeof nodes[i] === 'string') {
      varNames.push(nodes[i])
    } else if (Array.isArray(nodes[i])) {
      const name = `$$tpl___${i}`
      arrayCaptures[name] = nodes[i]
      varNames.push(name)
    } else {
      const name = `$tpl___${i}`
      captures[name] = nodes[i]
      varNames.push(name)
    }
  }
  const src = ([...ensureArray(code)] as string[]).reduce(
    (result: string, elem: string, i: number) => result + varNames[i - 1] + elem
  )
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
}
