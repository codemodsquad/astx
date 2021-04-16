import { TSPropertySignature, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSPropertySignatureReplacement(
  query: TSPropertySignature,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TSPropertySignature | ASTNode[]> | void {
  if (query.key.type === 'Identifier') {
    if (
      !query.optional &&
      !query.computed &&
      (query.typeAnnotation == null ||
        query.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.key.name = unescapeIdentifier(query.key.name)
  }
}
