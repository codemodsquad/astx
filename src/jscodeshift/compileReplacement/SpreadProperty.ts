import { SpreadProperty, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { unescapeIdentifier, compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadPropertyReplacement(
  path: ASTPath<SpreadProperty>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { argument } = pattern
  if (argument.type === 'Identifier') {
    const captureReplacement = compileArrayCaptureReplacement(
      path,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
    argument.name = unescapeIdentifier(argument.name)
  }
}