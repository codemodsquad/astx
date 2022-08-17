import { TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileTSTypeReferenceMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { typeName, typeParameters }: TSTypeReference = path.node

  if (typeName.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        typeName.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    } else {
      const special = compileSpecialMatcher(
        path,
        typeName.name,
        path
          .get('typeParameters')
          .get('params')
          .filter(() => true),
        compileOptions
      )

      if (special) return special
    }
  }
}
