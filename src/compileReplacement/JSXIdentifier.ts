import { JSXIdentifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierReplacement(
  path: ASTPath<JSXIdentifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<any> | void {
  const pattern = path.node
  const captureReplacement = compileCaptureReplacement(
    pattern,
    pattern.name,
    compileOptions
  )
  if (captureReplacement) return captureReplacement
  pattern.name = unescapeIdentifier(pattern.name)
}
