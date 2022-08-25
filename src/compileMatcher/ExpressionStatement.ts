import { ExpressionStatement, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileExpressionStatementMatcher(
  path: NodePath<ExpressionStatement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ExpressionStatement = path.node

  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
