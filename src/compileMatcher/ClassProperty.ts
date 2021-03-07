import { ClassProperty } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileClassPropertyMatcher(
  query: ClassProperty,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.key.type === 'Identifier') {
    if (
      !query.computed &&
      !query.static &&
      query.variance == null &&
      query.value == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        query.key.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.key.name = unescapeIdentifier(query.key.name)
  }
}
