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

  const captureReplacement = compilePlaceholderReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (captureReplacement) {
    if (typeAnnotation.value != null) {
      const typeAnnotationReplacement = compileGenericNodeReplacement(
        typeAnnotation,
        compileOptions
      )
      return {
        ...captureReplacement,
        generate: (match: ReplaceableMatch): Node | Node[] => {
          const generated = captureReplacement.generate(match)
          if (!Array.isArray(generated)) {
            ;(generated as any).typeAnnotation =
              typeAnnotationReplacement.generate(match)
          }
          return generated
        },
      }
    }
    return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
