import { TSTypeParameter, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileTSTypeParameterMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSTypeParameter = path.node

  if (
    pattern.constraint == null &&
    pattern.typeAnnotation == null &&
    pattern.default == null &&
    !pattern.optional
  ) {
    const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)

    if (captureMatcher) return captureMatcher
  }
}
