/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from 'ast-types'
import * as recast from 'recast'

type RecastType = typeof recast

const builders = recast.types.builders
const types = recast.types.namedTypes

function splice<T>(arr: T[], element: T, replacement: T[]) {
  arr.splice(arr.indexOf(element), 1, ...replacement)
}

function ensureStatement(node: t.ASTNode): t.namedTypes.Statement {
  return types.Statement.check(node)
    ? // Removing the location information seems to ensure that the node is
      // correctly reprinted with a trailing semicolon
      (node as any)
    : builders.expressionStatement(node as any)
}

function getVistor(
  varNames: string[],
  nodes: any[]
): recast.types.Visitor<any> {
  return {
    visitIdentifier(path) {
      this.traverse(path)
      const node = path.node
      const parent = path.parent.node

      // If this identifier is not one of our generated ones, do nothing
      const varIndex = varNames.indexOf(node.name)
      if (varIndex === -1) {
        return
      }

      const replacement = nodes[varIndex]
      nodes[varIndex] = null

      // If the replacement is an array, we need to explode the nodes in context
      if (Array.isArray(replacement)) {
        if (types.Function.check(parent) && parent.params.indexOf(node) > -1) {
          // Function parameters: function foo(${bar}) {}
          splice(parent.params, node, replacement)
        } else if (types.VariableDeclarator.check(parent)) {
          // Variable declarations: var foo = ${bar}, baz = 42;
          splice(path.parent.parent.node.declarations, parent, replacement)
        } else if (types.ArrayExpression.check(parent)) {
          // Arrays: var foo = [${bar}, baz];
          splice(parent.elements, node, replacement)
        } else if (types.Property.check(parent) && parent.shorthand) {
          // Objects: var foo = {${bar}, baz: 42};
          splice(path.parent.parent.node.properties, parent, replacement)
        } else if (
          types.CallExpression.check(parent) &&
          parent.arguments.indexOf(node) > -1
        ) {
          // Function call arguments: foo(${bar}, baz)
          splice(parent.arguments, node, replacement)
        } else if (types.ExpressionStatement.check(parent)) {
          // Generic sequence of statements: { ${foo}; bar; }
          path.parent.replace(path.parent, ...replacement.map(ensureStatement))
        } else {
          // Every else, let recast take care of it
          path.replace(...replacement)
        }
      } else if (types.ExpressionStatement.check(parent)) {
        path.parent.replace(ensureStatement(replacement))
      } else {
        path.replace(replacement)
      }
    },
  }
}

function replaceNodes(
  recast: RecastType,
  ast: t.namedTypes.File,
  varNames: string[],
  nodes: any[]
): t.namedTypes.File {
  const errors =
    ast.type === 'File' ? (ast as any).program.errors : (ast as any).errors
  if (errors?.length) {
    // Flow parser returns a bogus AST instead of throwing when the grammar is invalid,
    // but it at least includes parse errors in this array
    throw new Error(errors[0].message)
  }
  recast.visit(ast, getVistor(varNames, nodes))
  return ast
}

let varNameCounter = 0
function getUniqueVarName() {
  return `$jscodeshift${varNameCounter++}$`
}

export default function withParser(
  recast: RecastType,
  parseOptions?: recast.Options
): {
  statements: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => t.namedTypes.Statement[]
  statement: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => t.namedTypes.Statement
  expression: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => t.namedTypes.Expression
} {
  function statements(
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): t.namedTypes.Statement[] {
    const varNames = nodes.map(() => getUniqueVarName())
    const src = [...template].reduce(
      (result: string, elem: string, i: number) =>
        result + varNames[i - 1] + elem
    )

    return replaceNodes(
      recast,
      recast.parse(src, parseOptions),
      varNames,
      nodes
    ).program.body
  }

  function statement(
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): t.namedTypes.Statement {
    return statements(template, ...nodes)[0]
  }

  function expression(
    _template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): t.namedTypes.Expression {
    // wrap code in `(...)` to force evaluation as expression
    const template = [..._template]
    if (template.length > 0) {
      template[0] = '(' + template[0]
      template[template.length - 1] += ')'
    }

    const expression: any = (statement(template, ...nodes) as any).expression

    // Remove added parens
    if (expression.extra) {
      expression.extra.parenthesized = false
    }

    return expression
  }

  return { statements, statement, expression }
}
