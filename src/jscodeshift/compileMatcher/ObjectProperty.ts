import { ObjectProperty, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileObjectPropertyMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ObjectProperty = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      pattern.shorthand &&
      !pattern.computed &&
      pattern.accessibility == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
