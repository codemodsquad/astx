import { TypeParameter, ASTPath } from '../variant'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTypeParameterReplacement(
  path: ASTPath<TypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.variance == null && pattern.bound == null) {
    const captureReplacement = compileCaptureReplacement(
      path,
      pattern.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
