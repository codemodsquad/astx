import { ObjectProperty, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileObjectPropertyReplacement(
  path: NodePath<ObjectProperty, ObjectProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.Identifier.check(pattern.key)) {
    if (pattern.shorthand && !pattern.computed) {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
