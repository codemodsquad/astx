import { JSXIdentifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierMatcher(
  pattern: JSXIdentifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
  if (captureMatcher) return captureMatcher
  pattern.name = unescapeIdentifier(pattern.name)
}
