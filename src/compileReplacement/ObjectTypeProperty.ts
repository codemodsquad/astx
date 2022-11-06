import { ObjectTypeProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileObjectTypePropertyReplacement(
  path: NodePath<ObjectTypeProperty, ObjectTypeProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.Identifier.check(pattern.key)) {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      n.AnyTypeAnnotation.check(pattern.value) &&
      pattern.variance == null
    ) {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
