import { ObjectProperty } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileObjectPropertyMatcher(
  pattern: ObjectProperty,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.key.type === 'Identifier') {
    if (
      pattern.shorthand &&
      !pattern.computed &&
      pattern.accessibility == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        pattern.key.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.key.name = unescapeIdentifier(pattern.key.name)
  }
}
