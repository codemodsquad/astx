import { JSXIdentifier } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierMatcher(
  query: JSXIdentifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
  if (captureMatcher) return captureMatcher
  query.name = unescapeIdentifier(query.name)
}
