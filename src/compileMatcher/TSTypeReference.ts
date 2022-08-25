import { TSTypeReference, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileTSTypeReferenceMatcher(
  path: NodePath<TSTypeReference>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { typeName, typeParameters }: TSTypeReference = path.node
  const { hasNode } = compileOptions.backend

  if (typeName.type === 'Identifier') {
    if (typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        typeName.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    } else {
      const typeParametersPath = path.get('typeParameters')
      if (hasNode(typeParametersPath)) {
        const special = compileSpecialMatcher(
          path,
          typeName.name,
          typeParametersPath.get('params'),
          compileOptions
        )

        if (special) return special
      }
    }
  }
}
