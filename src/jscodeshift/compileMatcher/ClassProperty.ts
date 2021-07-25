import { ClassProperty, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileClassPropertyMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassProperty = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.computed &&
      !pattern.static &&
      pattern.variance == null &&
      pattern.value == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        pattern.key.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }

    pattern.key.name = unescapeIdentifier(pattern.key.name)
  }
}
