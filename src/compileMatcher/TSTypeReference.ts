import { TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileSpecialType from './SpecialType'

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
      const specialType = compileSpecialType(
        typeName.name,
        path,
        compileOptions
      )
      if (specialType) return specialType
    }
    typeName.name = unescapeIdentifier(typeName.name)
  }
}
