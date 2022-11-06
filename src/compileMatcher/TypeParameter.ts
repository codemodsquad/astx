import { TypeParameter, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileTypeParameterMatcher(
  path: NodePath<TypeParameter, TypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TypeParameter = path.value

  if (pattern.variance == null && pattern.bound == null) {
    const placeholderMatcher = compilePlaceholderMatcher(
      path,
      pattern.name,
      compileOptions,
      { nodeType: 'TypeParameter' }
    )

    if (placeholderMatcher) return placeholderMatcher
  }
}
