import { ClassProperty, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileClassPropertyMatcher(
  path: NodePath<ClassProperty, ClassProperty>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassProperty = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.key)) {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null
    ) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.key.name,
        compileOptions,
        {
          getCondition: () => (path: NodePath) =>
            (n as any).ClassBody.check(path.parent?.value),
        }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
