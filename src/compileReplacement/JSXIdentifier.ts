import { JSXIdentifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement, {
  unescapeIdentifier,
} from './Placeholder'

export default function compileJSXIdentifierReplacement(
  path: NodePath<JSXIdentifier, JSXIdentifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const captureReplacement = compilePlaceholderReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (captureReplacement) return captureReplacement
  pattern.name = unescapeIdentifier(pattern.name)
}
