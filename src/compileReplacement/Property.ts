import { NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'
import * as t from 'ast-types'

export default function compilePropertyReplacement(
  path: NodePath<t.namedTypes.Property, t.namedTypes.Property>,
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
