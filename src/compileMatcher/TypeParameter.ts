import { TypeParameter, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileTypeParameterMatcher(
  path: NodePath<TypeParameter, TypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TypeParameter = path.value

  if (pattern.variance == null && pattern.bound == null) {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
