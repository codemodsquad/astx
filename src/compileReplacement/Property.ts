import { Property, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compilePropertyReplacement(
  query: Property,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<Property | ASTNode[]> | void {
  if (query.key.type === 'Identifier') {
    if (query.shorthand && !query.computed) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.key.name = unescapeIdentifier(query.key.name)
  }
}
