import { TSPropertySignature, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSPropertySignatureReplacement(
  path: ASTPath<TSPropertySignature>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TSPropertySignature | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        pattern.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.key.name = unescapeIdentifier(pattern.key.name)
  }
}
