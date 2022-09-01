import { TSTypeParameter, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileTSTypeParameterReplacement(
  path: NodePath<TSTypeParameter, TSTypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (
    pattern.constraint == null &&
    pattern.typeAnnotation == null &&
    pattern.default == null &&
    !pattern.optional
  ) {
    const captureReplacement = compileCaptureReplacement(
      path,
      pattern.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
}
