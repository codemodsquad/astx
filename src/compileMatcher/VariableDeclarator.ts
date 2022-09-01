import { VariableDeclarator, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileVariableDeclaratorMatcher(
  path: NodePath<VariableDeclarator, VariableDeclarator>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: VariableDeclarator = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.id) && pattern.id.typeAnnotation == null) {
    if (pattern.init == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
