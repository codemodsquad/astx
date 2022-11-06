import { TSPropertySignature, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileTSPropertySignatureReplacement(
  path: NodePath<TSPropertySignature, TSPropertySignature>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.Identifier.check(pattern.key)) {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        (n.TSTypeReference.check(pattern.typeAnnotation?.typeAnnotation) &&
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
