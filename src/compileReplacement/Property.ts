import { NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'
import * as t from 'ast-types'

export default function compilePropertyReplacement(
  path: NodePath<t.namedTypes.Property>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.key.type === 'Identifier') {
    if (pattern.shorthand && !pattern.computed) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.key.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
