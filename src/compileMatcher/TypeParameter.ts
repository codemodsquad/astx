import { TypeParameter } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeParameterMatcher(
  query: TypeParameter,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.variance == null && query.bound == null) {
    const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
    if (captureMatcher) return captureMatcher
  }
  query.name = unescapeIdentifier(query.name)
}
