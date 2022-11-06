import { FunctionTypeParam, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileFunctionTypeParamReplacement(
  path: NodePath<FunctionTypeParam, FunctionTypeParam>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes

  if (
    n.GenericTypeAnnotation.check(pattern.typeAnnotation) &&
    n.Identifier.check(pattern.typeAnnotation.id)
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const placeholderReplacement = compilePlaceholderReplacement(
        path,
        pattern.typeAnnotation.id.name,
        compileOptions
      )
      if (placeholderReplacement) return placeholderReplacement
    }
  }
}
