import { TSTypeParameter, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterReplacement(
  query: TSTypeParameter,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TSTypeParameter | ASTNode[]> | void {
  if (
    query.constraint == null &&
    query.typeAnnotation == null &&
    query.default == null &&
    !query.optional
  ) {
    const captureReplacement = compileCaptureReplacement(
      query,
      query.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
  query.name = unescapeIdentifier(query.name)
}
