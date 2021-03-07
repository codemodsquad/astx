import { TSTypeParameter } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterMatcher(
  query: TSTypeParameter,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (
    query.constraint == null &&
    query.typeAnnotation == null &&
    query.default == null &&
    !query.optional
  ) {
    const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
    if (captureMatcher) return captureMatcher
  }
  query.name = unescapeIdentifier(query.name)
}
