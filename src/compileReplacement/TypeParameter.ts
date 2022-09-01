import { TypeParameter, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileTypeParameterReplacement(
  path: NodePath<TypeParameter, TypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  if (pattern.variance == null && pattern.bound == null) {
    const captureReplacement = compileCaptureReplacement(
      path,
      pattern.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
}
