import { GenericTypeAnnotation, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileGenericTypeAnnotationMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { id, typeParameters }: GenericTypeAnnotation = path.node

  if (id.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(id.name, compileOptions)

      if (captureMatcher) return captureMatcher
    } else {
      const special = compileSpecialMatcher(
        id.name,
        path
          .get('typeParameters')
          .get('params')
          .filter(() => true),
        compileOptions
      )

      if (special) return special
    }

    id.name = unescapeIdentifier(id.name)
  }
}
