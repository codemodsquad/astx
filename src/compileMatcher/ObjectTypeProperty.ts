import { ObjectTypeProperty } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileObjectTypePropertyMatcher(
  pattern: ObjectTypeProperty,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.key.type === 'Identifier') {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      pattern.value.type === 'AnyTypeAnnotation' &&
      pattern.variance == null
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
