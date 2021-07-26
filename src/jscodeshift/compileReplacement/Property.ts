import { Property, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compilePropertyReplacement(
  path: ASTPath<Property>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (pattern.shorthand && !pattern.computed) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.key.name = unescapeIdentifier(pattern.key.name)
  }
}
