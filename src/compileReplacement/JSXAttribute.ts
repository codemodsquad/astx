import j, { ASTNode, JSXAttribute } from 'jscodeshift'
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
  query: JSXAttribute,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<JSXAttribute | ASTNode[]> | void {
  if (query.name.type === 'JSXIdentifier') {
    if (query.value == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.name.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.name.name = unescapeIdentifier(query.name.name)
  }
}
