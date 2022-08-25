import { GenericTypeAnnotation, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileGenericTypeAnnotationMatcher(
  path: NodePath<GenericTypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { id, typeParameters }: GenericTypeAnnotation = path.node
  const { hasNode } = compileOptions.backend

  if (id.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    } else {
      const typeParametersPath = path.get('typeParameters')
      if (hasNode(typeParametersPath)) {
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
