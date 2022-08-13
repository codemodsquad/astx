import { JSXExpressionContainer, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileJSXExpressionContainerMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXExpressionContainer = path.node

  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
