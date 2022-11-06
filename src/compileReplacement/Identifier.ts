import { Node, Identifier, NodePath } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from './'
import compilePlaceholderReplacement from './Placeholder'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from './Placeholder'

export default function compileIdentifierReplacement(
  path: NodePath<Identifier, Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value

  const typeAnnotation = path.get('typeAnnotation')

  const placeholderReplacement = compilePlaceholderReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (placeholderReplacement) {
    if (typeAnnotation.value != null) {
      const typeAnnotationReplacement = compileGenericNodeReplacement(
        typeAnnotation,
        compileOptions
      )
      return {
        ...placeholderReplacement,
        generate: (match: ReplaceableMatch): Node | Node[] => {
          const generated = placeholderReplacement.generate(match)
          if (!Array.isArray(generated)) {
            ;(generated as any).typeAnnotation =
              typeAnnotationReplacement.generate(match)
          }
          return generated
        },
      }
    }
    return placeholderReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
