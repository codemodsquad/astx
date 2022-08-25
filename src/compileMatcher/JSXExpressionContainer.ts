import { JSXExpressionContainer, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileJSXExpressionContainerMatcher(
  path: NodePath<JSXExpressionContainer>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXExpressionContainer = path.node

  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
