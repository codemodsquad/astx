import { VariableDeclarator, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileVariableDeclaratorMatcher(
  path: NodePath<VariableDeclarator>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: VariableDeclarator = path.node

  if (pattern.id.type === 'Identifier' && pattern.id.typeAnnotation == null) {
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
