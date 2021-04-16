import { TypeParameter, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterReplacement(
  query: TypeParameter,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TypeParameter | ASTNode[]> | void {
  if (query.variance == null && query.bound == null) {
    const captureReplacement = compileCaptureReplacement(
      query,
      query.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
  query.name = unescapeIdentifier(query.name)
}
