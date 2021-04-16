import { JSXIdentifier } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierReplacement(
  query: JSXIdentifier,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<any> | void {
  const captureReplacement = compileCaptureReplacement(
    query,
    query.name,
    compileOptions
  )
  if (captureReplacement) return captureReplacement
  query.name = unescapeIdentifier(query.name)
}
