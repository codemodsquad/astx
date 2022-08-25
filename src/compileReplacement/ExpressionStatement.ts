import { ExpressionStatement, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileExpressionStatementReplacement(
  path: NodePath<ExpressionStatement>,
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
