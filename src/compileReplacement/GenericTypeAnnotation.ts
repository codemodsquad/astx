import { GenericTypeAnnotation, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileGenericTypeAnnotationReplacement(
  path: NodePath<GenericTypeAnnotation, GenericTypeAnnotation>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes
  if (n.Identifier.check(pattern.id)) {
    if (pattern.typeParameters == null) {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        pattern.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
