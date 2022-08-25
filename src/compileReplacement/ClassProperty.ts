import { ClassProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileClassPropertyReplacement(
  path: NodePath<ClassProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null
    ) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
