import { ClassProperty, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileClassPropertyMatcher(
  path: NodePath<ClassProperty>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassProperty = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
