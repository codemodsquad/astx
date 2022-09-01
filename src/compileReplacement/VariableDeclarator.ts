import { VariableDeclarator, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileVariableDeclaratorReplacement(
  path: NodePath<VariableDeclarator, VariableDeclarator>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  if (n.Identifier.check(pattern.id)) {
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
