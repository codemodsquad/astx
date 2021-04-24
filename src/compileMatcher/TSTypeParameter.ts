import { TSTypeParameter } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterMatcher(
  pattern: TSTypeParameter,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (
    pattern.constraint == null &&
    pattern.typeAnnotation == null &&
    pattern.default == null &&
    !pattern.optional
  ) {
    const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
    if (captureMatcher) return captureMatcher
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
