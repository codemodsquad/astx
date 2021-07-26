import { ClassImplements, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileClassImplementsReplacement(
  path: ASTPath<ClassImplements>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
