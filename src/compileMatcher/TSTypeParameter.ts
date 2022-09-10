import { TSTypeParameter, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileTSTypeParameterMatcher(
  path: NodePath<TSTypeParameter, TSTypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSTypeParameter = path.value

  if (pattern.constraint == null && pattern.default == null) {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.name,
      compileOptions,
      { nodeType: 'TSTypeParameter' }
    )

    if (captureMatcher) return captureMatcher
  }
}
