import { GenericTypeAnnotation, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileGenericTypeAnnotationMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: GenericTypeAnnotation = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        pattern.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
