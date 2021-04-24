import { GenericTypeAnnotation } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileGenericTypeAnnotationMatcher(
  pattern: GenericTypeAnnotation,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        pattern.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
