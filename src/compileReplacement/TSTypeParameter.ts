import { TSTypeParameter, ASTPath } from '../variant'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterReplacement(
  path: ASTPath<TSTypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
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
  pattern.name = unescapeIdentifier(pattern.name)
}
