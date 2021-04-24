import { JSXExpressionContainer } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXExpressionContainerMatcher(
  pattern: JSXExpressionContainer,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileArrayCaptureMatcher(
      pattern.expression.name,
      compileOptions
    )
    if (captureMatcher) return captureMatcher
    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
