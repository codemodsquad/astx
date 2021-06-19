import { ASTNode, Identifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'
import { Match } from '../find'

export default function compileIdentifierReplacement(
  path: ASTPath<Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { typeAnnotation } = pattern
  const captureReplacement = compileCaptureReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (captureReplacement) {
    if (typeAnnotation) {
      const typeAnnotationReplacement = compileGenericNodeReplacement(
        path.get('typeAnnotation'),
        compileOptions
      )
      return {
        ...captureReplacement,
        generate: (match: Match): ASTNode | ASTNode[] => {
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
