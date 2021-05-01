import { TypeParameter, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTypeParameterMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TypeParameter = path.node
  if (pattern.variance == null && pattern.bound == null) {
    const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
    if (captureMatcher) return captureMatcher
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
