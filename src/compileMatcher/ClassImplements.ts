import { NodePath, ClassImplements } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileClassImplementsMatcher(
  path: NodePath<ClassImplements, ClassImplements>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassImplements = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.id)) {
    if (pattern.typeParameters == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.id.name,
        compileOptions,
        { nodeType: 'ClassImplements' }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
