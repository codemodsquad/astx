import { ObjectTypeProperty, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileObjectTypePropertyReplacement(
  query: ObjectTypeProperty,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ObjectTypeProperty | ASTNode[]> | void {
  if (query.key.type === 'Identifier') {
    if (
      !(query as any).static &&
      !(query as any).proto &&
      !(query as any).method &&
      !query.optional &&
      query.value.type === 'AnyTypeAnnotation' &&
      query.variance == null
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
