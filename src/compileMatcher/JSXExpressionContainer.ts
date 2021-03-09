import { JSXExpressionContainer } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileJSXExpressionContainerMatcher(
  query: JSXExpressionContainer,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.expression.type === 'Identifier') {
    const captureMatcher = compileArrayCaptureMatcher(
      query.expression.name,
      compileOptions
    )
    if (captureMatcher) return captureMatcher
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
