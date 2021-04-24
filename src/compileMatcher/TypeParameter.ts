import { TypeParameter } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterMatcher(
  pattern: TypeParameter,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.variance == null && pattern.bound == null) {
    const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
    if (captureMatcher) return captureMatcher
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
