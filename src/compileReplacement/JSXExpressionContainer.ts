import { JSXExpressionContainer, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileJSXExpressionContainerReplacement(
  path: NodePath<JSXExpressionContainer>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.expression.type === 'Identifier') {
    const captureReplacement = compileCaptureReplacement(
      path,
      pattern.expression.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
}
