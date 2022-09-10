import { FunctionTypeParam, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileFunctionTypeParamMatcher(
  path: NodePath<FunctionTypeParam, FunctionTypeParam>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: FunctionTypeParam = path.value
  const n = compileOptions.backend.t.namedTypes
  if (
    n.GenericTypeAnnotation.check(pattern.typeAnnotation) &&
    n.Identifier.check(pattern.typeAnnotation.id)
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.typeAnnotation.id.name,
        compileOptions,
        { nodeType: 'FunctionTypeParam' }
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
