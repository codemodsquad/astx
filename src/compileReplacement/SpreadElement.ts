import { SpreadElement, Property, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { unescapeIdentifier, compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadElementReplacement(
  path: ASTPath<SpreadElement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<Property[]> | void {
  const pattern = path.node
  const { argument } = pattern
  if (argument.type === 'Identifier') {
    const captureReplacement = compileArrayCaptureReplacement(
      pattern,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
    argument.name = unescapeIdentifier(argument.name)
  }
}
