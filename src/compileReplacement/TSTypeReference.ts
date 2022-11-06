import { TSTypeReference, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileTSTypeReferenceReplacement(
  path: NodePath<TSTypeReference, TSTypeReference>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.Identifier.check(pattern.typeName)) {
    if (pattern.typeParameters == null) {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        pattern.typeName.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
