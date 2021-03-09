import { Identifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileIdentifierMatcher(
  query: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.typeAnnotation != null)
    return compileGenericNodeMatcher(query, compileOptions)
  const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
  if (captureMatcher) return captureMatcher
  query.name = unescapeIdentifier(query.name)
}
