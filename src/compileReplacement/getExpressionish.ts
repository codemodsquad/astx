import j, { ASTNode, Expression } from 'jscodeshift'
import t from 'ast-types'

export default function getExpressionish(node: ASTNode): Expression | void {
  switch (node.type) {
    case 'ExpressionStatement':
    case 'JSXExpressionContainer':
      return node.expression
    case 'JSXIdentifier':
      return j.identifier(node)
    case 'JSXText':
      return j.stringLiteral(node.value)
  }
  if (t.namedTypes.Expression.check(node)) return node
}
