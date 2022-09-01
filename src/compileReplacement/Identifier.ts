import { Node, Identifier, NodePath } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'

export default function compileIdentifierReplacement(
  path: NodePath<Identifier, Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value

  const typeAnnotation = path.get('typeAnnotation')

  const captureReplacement = compileCaptureReplacement(
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
