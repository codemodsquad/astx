import { JSXAttribute } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXAttributeMatcher(
  query: JSXAttribute,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.name.type === 'JSXIdentifier') {
    if (query.value == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        query.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.name.name = unescapeIdentifier(query.name.name)
  }
}
