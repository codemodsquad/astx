import { ObjectTypeProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileObjectTypePropertyReplacement(
  path: NodePath<ObjectTypeProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      pattern.value.type === 'AnyTypeAnnotation' &&
      pattern.variance == null
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
