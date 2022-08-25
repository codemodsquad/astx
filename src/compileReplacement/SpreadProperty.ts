import { SpreadProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadPropertyReplacement(
  path: NodePath<SpreadProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { argument } = pattern
  if (argument.type === 'Identifier') {
    const captureReplacement = compileArrayCaptureReplacement(
      path,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
  }
}
