import { ObjectProperty, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileObjectPropertyReplacement(
  query: ObjectProperty,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ObjectProperty | ASTNode[]> | void {
  if (query.key.type === 'Identifier') {
    if (query.shorthand && !query.computed && query.accessibility == null) {
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
