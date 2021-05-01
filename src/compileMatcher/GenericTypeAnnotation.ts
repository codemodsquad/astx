import { GenericTypeAnnotation, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileOptionalMatcher from './Optional'

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
      switch (id.name) {
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
    id.name = unescapeIdentifier(id.name)
  }
}
