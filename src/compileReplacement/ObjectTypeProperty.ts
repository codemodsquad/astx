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
      n.GenericTypeAnnotation.check(pattern.value) &&
      n.Identifier.check(pattern.value.id) &&
      pattern.value.id.name === '$' &&
      pattern.variance == null
    ) {
      const placeholderReplacement = compilePlaceholderReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (placeholderReplacement) return placeholderReplacement
    }
  }
}
