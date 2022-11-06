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
  const placeholderReplacement = compilePlaceholderReplacement(
    path,
    pattern.name,
    compileOptions
  )
  if (placeholderReplacement) return placeholderReplacement
  pattern.name = unescapeIdentifier(pattern.name)
}
