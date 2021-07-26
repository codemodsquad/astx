import { JSXExpressionContainer, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXExpressionContainerMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXExpressionContainer = path.node

  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileArrayCaptureMatcher(
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher

    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
