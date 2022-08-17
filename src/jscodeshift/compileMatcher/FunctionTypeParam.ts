import { FunctionTypeParam, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileFunctionTypeParamMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: FunctionTypeParam = path.node
  if (
    pattern.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    pattern.typeAnnotation.id.type === 'Identifier'
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.typeAnnotation.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
