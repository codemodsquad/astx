import { VariableDeclarator, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileVariableDeclaratorMatcher(
  path: NodePath<VariableDeclarator, VariableDeclarator>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: VariableDeclarator = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.id) && pattern.id.typeAnnotation == null) {
    if (pattern.init == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.id.name,
        compileOptions,
        { nodeType: 'VariableDeclarator' }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
