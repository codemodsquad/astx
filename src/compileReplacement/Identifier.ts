import { Node, Identifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'
import { Match } from '../find'

export default function compileIdentifierReplacement(
  path: NodePath<Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { hasNode } = compileOptions.backend

  const typeAnnotation = path.get('typeAnnotation')

  const captureReplacement = compileCaptureReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (captureReplacement) {
    if (typeAnnotation && hasNode(typeAnnotation)) {
      const typeAnnotationReplacement = compileGenericNodeReplacement(
        typeAnnotation,
        compileOptions
      )
      return {
        ...captureReplacement,
        generate: (match: Match): Node | Node[] => {
          const generated = captureReplacement.generate(match)
          if (!Array.isArray(generated)) {
            ;(generated as any).typeAnnotation = typeAnnotationReplacement.generate(
              match
            )
          }
          return generated
        },
      }
    }
    return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
