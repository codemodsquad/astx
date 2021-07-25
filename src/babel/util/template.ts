/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  ASTNode,
  Expression,
  Statement,
  ASTPath,
  File,
  forEachNode,
  Identifier,
  isStatement,
  t,
  isFunction,
  isVariableDeclarator,
  isArrayExpression,
  isProperty,
  isCallExpression,
  isExpressionStatement,
  toPaths,
  Parser,
} from '../variant'

function splice<T>(arr: T[], element: T, replacement: T[]) {
  arr.splice(arr.indexOf(element), 1, ...replacement)
}

function ensureStatement(node: ASTNode): Statement {
  return isStatement(node)
    ? // Removing the location information seems to ensure that the node is
      // correctly reprinted with a trailing semicolon
      (node as any)
    : t.expressionStatement(node as any)
}

function replaceNodes(
  src: string,
  varNames: string[],
  nodes: any[],
  parser: Parser
): ASTNode {
  const ast = parser.parse(src)
  const errors =
    ast.type === 'File' ? (ast.program as any).errors : (ast as any).errors
  if (errors?.length) {
    // Flow parser returns a bogus AST instead of throwing when the grammar is invalid,
    // but it at least includes parse errors in this array
    throw new Error(errors[0].message)
  }
  forEachNode(toPaths(ast), ['Identifier'], (path: ASTPath<Identifier>) => {
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
      if (isFunction(parent) && parent.params.indexOf(node) > -1) {
        // Function parameters: function foo(${bar}) {}
        splice(parent.params, node, replacement)
      } else if (isVariableDeclarator(parent)) {
        // Variable declarations: var foo = ${bar}, baz = 42;
        splice(path.parent.parent.node.declarations, parent, replacement)
      } else if (isArrayExpression(parent)) {
        // Arrays: var foo = [${bar}, baz];
        splice(parent.elements, node, replacement)
      } else if (isProperty(parent) && parent.shorthand) {
        // Objects: var foo = {${bar}, baz: 42};
        splice(path.parent.parent.node.properties, parent, replacement)
      } else if (
        isCallExpression(parent) &&
        parent.arguments.indexOf(node) > -1
      ) {
        // Function call arguments: foo(${bar}, baz)
        splice(parent.arguments, node, replacement)
      } else if (isExpressionStatement(parent)) {
        // Generic sequence of statements: { ${foo}; bar; }
        path.parent.replace(path.parent, ...replacement.map(ensureStatement))
      } else {
        // Every else, let recast take care of it
        path.replace(...replacement)
      }
    } else if (isExpressionStatement(parent)) {
      path.parent.replace(ensureStatement(replacement))
    } else {
      path.replace(replacement)
    }
  })
  return ast
}

let varNameCounter = 0
function getUniqueVarName() {
  return `$jscodeshift${varNameCounter++}$`
}

export default function withParser(
  parser: Parser
): {
  statements: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => Statement[]
  statement: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => Statement
  expression: (
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ) => Expression
} {
  function statements(
    _template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): Statement[] {
    function attempt(template: TemplateStringsArray | string[]): Statement[] {
      const varNames = nodes.map(() => getUniqueVarName())
      const src = [...template].reduce(
        (result: string, elem: string, i: number) =>
          result + varNames[i - 1] + elem
      )

      return (replaceNodes(src, varNames, nodes, parser) as File).program.body
    }
    try {
      const template = [..._template]
      if (template.length > 0) {
        template[0] = 'async () => {' + template[0]
        template[template.length - 1] += '}'
      }
      return (attempt(template)[0] as any).expression.body.body
    } catch (error) {
      return attempt(_template)
    }
  }

  function statement(
    template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): Statement {
    return statements(template, ...nodes)[0]
  }

  function expression(
    _template: TemplateStringsArray | string[],
    ...nodes: any[]
  ): Expression {
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
