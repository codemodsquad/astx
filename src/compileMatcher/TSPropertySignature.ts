import { TSPropertySignature, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileTSPropertySignatureMatcher(
  path: NodePath<TSPropertySignature, TSPropertySignature>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSPropertySignature = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.key)) {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        (n.TSTypeReference.check(pattern.typeAnnotation?.typeAnnotation) &&
          n.Identifier.check(pattern.typeAnnotation.typeAnnotation.typeName) &&
          pattern.typeAnnotation.typeAnnotation.typeName.name === '$'))
    ) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.key.name,
        compileOptions,
        { nodeType: 'TSTypeElement' }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
