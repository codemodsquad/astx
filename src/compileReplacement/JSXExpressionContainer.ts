import t from 'ast-types'
import j, {
  JSXExpressionContainer,
  JSXElement,
  JSXText,
  ASTNode,
  Literal,
  StringLiteral,
  ASTPath,
} from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export function convertCaptureToJSXAttributeValue(
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
    `converting ${node.type} to a JSX Attribute value is not supported`
  )
}

export function convertCaptureToJSXChild(
  node: ASTNode
): JSXExpressionContainer | JSXElement | JSXText {
  switch (node.type) {
    case 'JSXElement':
    case 'JSXExpressionContainer':
    case 'JSXText':
      return node
    default:
      if (t.namedTypes.Expression.check(node))
        return j.jsxExpressionContainer(node)
  }
  throw new Error(`converting ${node.type} to JSX child is not supported`)
}

const jsxAttributeValueCaptureOptions = {
  convertCapture: convertCaptureToJSXAttributeValue,
}
const jsxChildCaptureOptions = {
  convertCapture: convertCaptureToJSXChild,
}

export default function compileJSXExpressionContainerReplacement(
  path: ASTPath<JSXExpressionContainer>,
  compileOptions: CompileReplacementOptions
):
  | CompiledReplacement<
      JSXExpressionContainer | Literal | StringLiteral | ASTNode[]
    >
  | CompiledReplacement<
      JSXExpressionContainer | JSXElement | JSXText | ASTNode[]
    >
  | void {
  const pattern = path.node
  if (pattern.expression.type === 'Identifier') {
    const captureReplacement =
      path.parentPath.node.type === 'JSXElement'
        ? compileCaptureReplacement(
            pattern,
            pattern.expression.name,
            compileOptions,
            jsxChildCaptureOptions
          )
        : compileCaptureReplacement(
            pattern,
            pattern.expression.name,
            compileOptions,
            jsxAttributeValueCaptureOptions
          )
    if (captureReplacement) return captureReplacement
    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
