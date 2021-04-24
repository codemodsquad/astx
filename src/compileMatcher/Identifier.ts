import { Identifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileIdentifierMatcher(
  pattern: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.typeAnnotation != null)
    return compileGenericNodeMatcher(pattern, compileOptions)
  const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
  if (captureMatcher) return captureMatcher
  pattern.name = unescapeIdentifier(pattern.name)
}
