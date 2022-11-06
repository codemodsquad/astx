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
      pattern.value == null
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
