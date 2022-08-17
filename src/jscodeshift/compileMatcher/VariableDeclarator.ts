import { VariableDeclarator, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileVariableDeclaratorMatcher(
  path: ASTPath<any>,
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
