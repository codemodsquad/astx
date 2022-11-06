import { TSTypeParameter, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileTSTypeParameterMatcher(
  path: NodePath<TSTypeParameter, TSTypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSTypeParameter = path.value

  if (pattern.constraint == null && pattern.default == null) {
    const placeholderMatcher = compilePlaceholderMatcher(
      path,
      pattern.name,
      compileOptions,
      { nodeType: 'TSTypeParameter' }
    )

    if (placeholderMatcher) return placeholderMatcher
  }
}
