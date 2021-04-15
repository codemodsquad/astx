import { ObjectProperty } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileObjectPropertyMatcher(
  query: ObjectProperty,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.key.type === 'Identifier') {
    if (query.shorthand && !query.computed && query.accessibility == null) {
      const captureMatcher = compileCaptureMatcher(
        query.key.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.key.name = unescapeIdentifier(query.key.name)
  }
}
