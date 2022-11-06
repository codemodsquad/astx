import { JSXAttribute, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileJSXAttributeReplacement(
  path: NodePath<JSXAttribute, JSXAttribute>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.JSXIdentifier.check(pattern.name)) {
    if (pattern.value == null) {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        pattern.name.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
