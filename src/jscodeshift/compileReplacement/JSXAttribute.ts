import { JSXAttribute, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileJSXAttributeReplacement(
  path: ASTPath<JSXAttribute>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.name.type === 'JSXIdentifier') {
    if (pattern.value == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.name.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
