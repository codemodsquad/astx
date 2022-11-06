import { ObjectTypeProperty, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileObjectTypePropertyMatcher(
  path: NodePath<ObjectTypeProperty, ObjectTypeProperty>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ObjectTypeProperty = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.key)) {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      n.GenericTypeAnnotation.check(pattern.value) &&
      n.Identifier.check(pattern.value.id) &&
      pattern.value.id.name === '$' &&
      pattern.variance == null
    ) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.key.name,
        compileOptions,
        {
          nodeType: 'Flow',
          getCondition: () => (path: NodePath) =>
            n.ObjectTypeAnnotation.check(path.parent?.value),
        }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
