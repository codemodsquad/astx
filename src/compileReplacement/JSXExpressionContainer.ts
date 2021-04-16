import t from 'ast-types'
import j, {
  JSXExpressionContainer,
  ASTNode,
  Literal,
  StringLiteral,
} from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export function convertCaptureToJSXExpressionContainer(
  node: ASTNode
): JSXExpressionContainer | Literal | StringLiteral {
  switch (node.type) {
    case 'JSXExpressionContainer':
      return node
    default:
      if (t.namedTypes.Expression.check(node))
        return j.jsxExpressionContainer(node)
  }
  throw new Error(
    `converting ${node.type} to JSXExpressionContainer is not supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureToJSXExpressionContainer,
}

export default function compileJSXExpressionContainerReplacement(
  query: JSXExpressionContainer,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<
  JSXExpressionContainer | Literal | StringLiteral | ASTNode[]
> | void {
  if (query.expression.type === 'Identifier') {
    const captureReplacement = compileCaptureReplacement(
      query,
      query.expression.name,
      compileOptions,
      captureOptions
    )
    if (captureReplacement) return captureReplacement
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
