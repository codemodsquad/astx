import { VariableDeclarator, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileVariableDeclaratorMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: VariableDeclarator = path.node

  if (pattern.id.type === 'Identifier' && pattern.id.typeAnnotation == null) {
    if (pattern.init == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }

    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
