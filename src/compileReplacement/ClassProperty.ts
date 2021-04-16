import { ClassProperty, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileClassPropertyReplacement(
  query: ClassProperty,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ClassProperty | ASTNode[]> | void {
  if (query.key.type === 'Identifier') {
    if (
      !query.computed &&
      !query.static &&
      query.variance == null &&
      query.value == null
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
