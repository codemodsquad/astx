import { SpreadElement, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadElementReplacement(
  path: NodePath<SpreadElement, SpreadElement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  const { argument } = pattern
  if (n.Identifier.check(argument)) {
    const captureReplacement = compileArrayCaptureReplacement(
      path,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
  }
}
