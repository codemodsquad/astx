import { FunctionTypeParam } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileFunctionTypeParamMatcher(
  pattern: FunctionTypeParam,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.name?.type === 'Identifier') {
    if (pattern.typeAnnotation == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.name.name = unescapeIdentifier(pattern.name.name)
  }
  if (
    pattern.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    pattern.typeAnnotation.id.type === 'Identifier'
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.typeAnnotation.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.typeAnnotation.id.name = unescapeIdentifier(
      pattern.typeAnnotation.id.name
    )
  }
}
