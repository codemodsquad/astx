import { JSXIdentifier, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXIdentifierMatcher(
  path: ASTPath<any>,
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
