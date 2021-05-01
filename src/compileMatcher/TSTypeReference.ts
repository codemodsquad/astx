import { TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileTSTypeReferenceMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { typeName, typeParameters }: TSTypeReference = path.node
  if (typeName.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        typeName.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    } else {
      const special = compileSpecialMatcher(
        typeName.name,
        path
          .get('typeParameters')
          .get('params')
          .filter(() => true),
        compileOptions
      )
      if (special) return special
    }
    typeName.name = unescapeIdentifier(typeName.name)
  }
}
