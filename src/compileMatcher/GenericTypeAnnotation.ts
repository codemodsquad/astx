import { GenericTypeAnnotation, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileSpecialType from './SpecialType'

export default function compileGenericTypeAnnotationMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { id, typeParameters }: GenericTypeAnnotation = path.node
  if (id.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(id.name, compileOptions)
      if (captureMatcher) return captureMatcher
    } else {
      const specialType = compileSpecialType(id.name, path, compileOptions)
      if (specialType) return specialType
    }
    id.name = unescapeIdentifier(id.name)
  }
}
