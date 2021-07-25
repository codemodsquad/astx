import { ObjectTypeProperty, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileObjectTypePropertyMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ObjectTypeProperty = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      !(pattern as any).static &&
      !(pattern as any).proto &&
      !(pattern as any).method &&
      !pattern.optional &&
      pattern.value.type === 'AnyTypeAnnotation' &&
      pattern.variance == null
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
