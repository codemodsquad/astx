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
        compileOptions,
        {
          nodeType: 'JSX',
          getCondition: () => (path) =>
            n.JSXOpeningElement.check(path.parent?.value) &&
            path.parentPath?.name === 'attributes',
        }
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
