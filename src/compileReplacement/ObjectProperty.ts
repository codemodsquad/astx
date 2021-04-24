import { ObjectProperty, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileObjectPropertyReplacement(
  path: ASTPath<ObjectProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ObjectProperty | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      pattern.shorthand &&
      !pattern.computed &&
      pattern.accessibility == null
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
