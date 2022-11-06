import { GenericTypeAnnotation, NodePath, pathIs } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileGenericTypeAnnotationMatcher(
  path: NodePath<GenericTypeAnnotation, GenericTypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { id, typeParameters }: GenericTypeAnnotation = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(id)) {
    if (typeParameters == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        id.name,
        compileOptions,
        { nodeType: 'FlowType' }
      )

      if (placeholderMatcher) return placeholderMatcher
    } else {
      const typeParametersPath = path.get('typeParameters')
      if (pathIs(typeParametersPath, n.TypeParameterInstantiation)) {
        const special = compileSpecialMatcher(
          path,
          id.name,
          typeParametersPath.get('params'),
          compileOptions
        )

        if (special) return special
      }
    }
  }
}
