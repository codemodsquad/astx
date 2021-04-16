import { SpreadElement, Property } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { unescapeIdentifier, compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadElementReplacement(
  query: SpreadElement,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<Property[]> | void {
  const { argument } = query
  if (argument.type === 'Identifier') {
    const captureReplacement = compileArrayCaptureReplacement(
      query,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
    argument.name = unescapeIdentifier(argument.name)
  }
}
