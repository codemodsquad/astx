import { ObjectTypeProperty, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

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
      n.AnyTypeAnnotation.check(pattern.value) &&
      pattern.variance == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions,
        {
          nodeType: 'Flow',
          getCondition: () => (path: NodePath) =>
            n.ObjectTypeAnnotation.check(path.parent?.value),
        }
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
