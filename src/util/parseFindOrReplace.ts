import jscodeshift, {
  Expression,
  ExpressionStatement,
  JSCodeshift,
  Statement,
  ASTPath,
  ASTNode,
  Node,
} from 'jscodeshift'
import template from './template'
import { forEachNode } from './forEachNode'

function getPath<Node extends ASTNode>(node: Node): ASTPath<Node> {
  return jscodeshift([node]).paths()[0]
}

function parseFindOrReplace0(
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

export default function parseFindOrReplace(
  j: JSCodeshift,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
  const ast = parseFindOrReplace0(j, strings, ...quasis)
  let extractedNode: Node | undefined
  forEachNode(
    Array.isArray(ast)
      ? ast.map((n) => getPath(n as ASTNode))
      : [getPath(ast as ASTNode)],
    ['Node'],
    (path: ASTPath<Node>) => {
      if (path.node.comments) {
        for (const c of path.node.comments) {
          if (!c.value) extractedNode = path.node
        }
      }
    }
  )
  return extractedNode || ast
}
