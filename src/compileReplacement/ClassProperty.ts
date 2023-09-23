import { ClassProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileClassPropertyReplacement(
  path: NodePath<ClassProperty, ClassProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes
  if (n.Identifier.check(pattern.key)) {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null &&
      (pattern.typeAnnotation == null ||
        (n.TypeAnnotation.check(pattern.typeAnnotation) &&
          n.GenericTypeAnnotation.check(
            pattern.typeAnnotation?.typeAnnotation
          ) &&
          n.Identifier.check(pattern.typeAnnotation.typeAnnotation.id) &&
          pattern.typeAnnotation.typeAnnotation.id.name === '$') ||
        (n.TSTypeAnnotation.check(pattern.typeAnnotation) &&
          n.TSTypeReference.check(pattern.typeAnnotation?.typeAnnotation) &&
          n.Identifier.check(pattern.typeAnnotation.typeAnnotation.typeName) &&
          pattern.typeAnnotation.typeAnnotation.typeName.name === '$'))
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
