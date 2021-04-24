import { ObjectTypeProperty, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileObjectTypePropertyReplacement(
  path: ASTPath<ObjectTypeProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ObjectTypeProperty | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      pattern.value.type === 'AnyTypeAnnotation' &&
      pattern.variance == null
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
