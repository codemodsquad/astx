import { JSXAttribute } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXAttributeMatcher(
  pattern: JSXAttribute,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.name.type === 'JSXIdentifier') {
    if (pattern.value == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.name.name = unescapeIdentifier(pattern.name.name)
  }
}
