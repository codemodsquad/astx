import { ClassImplements, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileClassImplementsReplacement(
  path: NodePath<ClassImplements, ClassImplements>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes
  if (n.Identifier.check(pattern.id)) {
    if (pattern.typeParameters == null) {
      const placeholderReplacement = compilePlaceholderReplacement(
        path,
        pattern.id.name,
        compileOptions
      )
      if (placeholderReplacement) return placeholderReplacement
    }
  }
}
