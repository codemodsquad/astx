import { TSTypeReference, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileTSTypeReferenceMatcher(
  path: NodePath<TSTypeReference, TSTypeReference>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { typeName, typeParameters }: TSTypeReference = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(typeName)) {
    if (typeParameters == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        typeName.name,
        compileOptions,
        { nodeType: 'TSType' }
      )

      if (placeholderMatcher) return placeholderMatcher
    } else {
      const typeParametersPath = path.get('typeParameters')
      if (typeParametersPath.value) {
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
