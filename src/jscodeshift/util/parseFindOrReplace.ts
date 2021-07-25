import template from './template'
import {
  forEachNode,
  getPath,
  Expression,
  ExpressionStatement,
  Statement,
  ASTPath,
  ASTNode,
  Parser,
} from '../variant'

function parseFindOrReplace0(
  parser: Parser,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
  const { expression, statements } = template(parser)
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

export default function parseFindOrReplace(
  parser: Parser,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
  const ast = parseFindOrReplace0(parser, strings, ...quasis)
  let extractedNode: ASTNode | undefined
  forEachNode(
    Array.isArray(ast)
      ? ast.map((n) => getPath(n as ASTNode))
      : [getPath(ast as ASTNode)],
    ['Node'],
    (path: ASTPath<any>) => {
      if (path.node.comments) {
        for (const c of path.node.comments) {
          if (!c.value) extractedNode = path.node
        }
      }
    }
  )
  return extractedNode || ast
}
