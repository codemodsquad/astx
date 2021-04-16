import { SpreadProperty, ObjectProperty } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { unescapeIdentifier, compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadPropertyReplacement(
  query: SpreadProperty,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ObjectProperty> | void {
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
