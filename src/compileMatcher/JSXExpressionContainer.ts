import { JSXExpressionContainer, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileJSXExpressionContainerMatcher(
  path: NodePath<JSXExpressionContainer, JSXExpressionContainer>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXExpressionContainer = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.expression)) {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
