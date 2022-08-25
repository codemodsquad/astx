import { JSXIdentifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierMatcher(
  path: NodePath<JSXIdentifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXIdentifier = path.node
  const captureMatcher = compileCaptureMatcher(
    path,
    pattern.name,
    compileOptions
  )

  if (captureMatcher) return captureMatcher

  pattern.name = unescapeIdentifier(pattern.name)
}
