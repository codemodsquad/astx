import { ClassImplements, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileClassImplementsMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassImplements = path.node

  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
