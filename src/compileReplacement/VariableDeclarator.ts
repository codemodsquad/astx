import { VariableDeclarator, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileVariableDeclaratorReplacement(
  path: NodePath<VariableDeclarator>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.init == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
