import { GenericTypeAnnotation, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileGenericTypeAnnotationReplacement(
  path: NodePath<GenericTypeAnnotation>,
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.id.name,
        compileReplacementOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
