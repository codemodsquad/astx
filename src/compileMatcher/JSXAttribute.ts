import { JSXAttribute, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileJSXAttributeMatcher(
  path: NodePath<JSXAttribute, JSXAttribute>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXAttribute = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.JSXIdentifier.check(pattern.name)) {
    if (pattern.value == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.name.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
