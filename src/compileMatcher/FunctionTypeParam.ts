import { FunctionTypeParam } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileFunctionTypeParamMatcher(
  query: FunctionTypeParam,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.name?.type === 'Identifier') {
    if (query.typeAnnotation == null) {
      const captureMatcher = compileCaptureMatcher(
        query.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.name.name = unescapeIdentifier(query.name.name)
  }
  if (
    query.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    query.typeAnnotation.id.type === 'Identifier'
  ) {
    if (query.typeAnnotation.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        query.typeAnnotation.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.typeAnnotation.id.name = unescapeIdentifier(
      query.typeAnnotation.id.name
    )
  }
}
