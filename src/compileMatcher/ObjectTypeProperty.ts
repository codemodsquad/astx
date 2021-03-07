import { ObjectTypeProperty } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileObjectTypePropertyMatcher(
  query: ObjectTypeProperty,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.key.type === 'Identifier') {
    if (
      !(query as any).static &&
      !(query as any).proto &&
      !(query as any).method &&
      !query.optional &&
      query.value.type === 'AnyTypeAnnotation' &&
      query.variance == null
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
