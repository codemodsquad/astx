import { JSXAttribute, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileJSXAttributeMatcher(
  path: NodePath<JSXAttribute, JSXAttribute>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXAttribute = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.JSXIdentifier.check(pattern.name)) {
    if (pattern.value == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
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

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
