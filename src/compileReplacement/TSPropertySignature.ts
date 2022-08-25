import { TSPropertySignature, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileTSPropertySignatureReplacement(
  path: NodePath<TSPropertySignature>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        pattern.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
