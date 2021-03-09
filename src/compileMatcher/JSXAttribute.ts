import { JSXAttribute } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXAttributeMatcher(
  query: JSXAttribute,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.name.type === 'JSXIdentifier') {
    if (query.value == null) {
      const captureMatcher = compileCaptureMatcher(
        query.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.name.name = unescapeIdentifier(query.name.name)
  }
}
