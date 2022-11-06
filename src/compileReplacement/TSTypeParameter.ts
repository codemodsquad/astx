import { TSTypeParameter, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileTSTypeParameterReplacement(
  path: NodePath<TSTypeParameter, TSTypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  if (pattern.constraint == null && pattern.default == null) {
    const captureReplacement = compilePlaceholderReplacement(
      path,
      pattern.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
  }
}
