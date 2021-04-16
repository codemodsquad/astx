import { GenericTypeAnnotation, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileGenericTypeAnnotationReplacement(
  query: GenericTypeAnnotation,
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement<GenericTypeAnnotation | ASTNode[]> | void {
  if (query.id.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.id.name,
        compileReplacementOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.id.name = unescapeIdentifier(query.id.name)
  }
}
