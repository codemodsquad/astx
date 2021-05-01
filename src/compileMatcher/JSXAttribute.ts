import { JSXAttribute, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXAttributeMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXAttribute = path.node
  if (pattern.name.type === 'JSXIdentifier') {
    if (pattern.value == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.name.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.name.name = unescapeIdentifier(pattern.name.name)
  }
}
