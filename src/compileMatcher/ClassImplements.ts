import { ClassImplements, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileClassImplementsMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassImplements = path.node

  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }

    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
