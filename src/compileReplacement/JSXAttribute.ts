import j, { ASTNode, JSXAttribute, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import { convertCaptureToJSXExpressionContainer } from './JSXExpressionContainer'

export function convertCaptureToJSXAttribute(node: ASTNode): JSXAttribute {
  switch (node.type) {
    case 'ObjectProperty':
    case 'Property':
      if (node.key.type === 'Identifier' && !node.computed) {
        return j.jsxAttribute(
          j.jsxIdentifier(node.key.name),
          convertCaptureToJSXExpressionContainer(node.value)
        )
      }
      return j.jsxSpreadAttribute(j.objectExpression([node]))
    case 'SpreadElement':
    case 'SpreadProperty':
      return j.jsxSpreadAttribute(node.argument)
    case 'JSXAttribute':
      return node
  }
  throw new Error(`converting ${node.type} to JSXAttribute isn't supported`)
}

const captureOptions = {
  convertCapture: convertCaptureToJSXAttribute,
}

export default function compileJSXAttributeReplacement(
  path: ASTPath<JSXAttribute>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<JSXAttribute | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.name.type === 'JSXIdentifier') {
    if (pattern.value == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.name.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.name.name = unescapeIdentifier(pattern.name.name)
  }
}
