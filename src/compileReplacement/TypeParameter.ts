import { TypeParameter, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileTypeParameterReplacement(
  path: NodePath<TypeParameter, TypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  if (pattern.variance == null && pattern.bound == null) {
    const placeholderReplacement = compilePlaceholderReplacement(
      path,
      pattern.name,
      compileOptions
    )
    if (placeholderReplacement) return placeholderReplacement
  }
}
