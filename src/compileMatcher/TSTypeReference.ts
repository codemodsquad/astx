import { TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileOptionalMatcher from './Optional'

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
      switch (typeName.name) {
        case '$Optional':
          if (typeParameters?.params?.length !== 1) {
            throw new Error(`$Optional must be used with 1 type parameter`)
          }
          return compileOptionalMatcher(
            path.get('typeParameters').get('params').get(0),
            compileOptions
          )
      }
    }
    typeName.name = unescapeIdentifier(typeName.name)
  }
}
