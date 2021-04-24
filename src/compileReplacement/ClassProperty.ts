import { ClassProperty, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileClassPropertyReplacement(
  path: ASTPath<ClassProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ClassProperty | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null
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
