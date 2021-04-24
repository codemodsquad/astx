import { TypeParameter, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterReplacement(
  path: ASTPath<TypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TypeParameter | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.variance == null && pattern.bound == null) {
    const captureReplacement = compileCaptureReplacement(
      pattern,
      pattern.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
