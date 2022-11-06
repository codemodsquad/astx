import { SpreadElement, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { compileArrayPlaceholderReplacement } from './Placeholder'

export default function compileSpreadElementReplacement(
  path: NodePath<SpreadElement, SpreadElement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  const { argument } = pattern
  if (n.Identifier.check(argument)) {
    const captureReplacement = compileArrayPlaceholderReplacement(
      path,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
  }
}
