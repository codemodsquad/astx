import { ExpressionStatement, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileExpressionStatementMatcher(
  path: NodePath<ExpressionStatement, ExpressionStatement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ExpressionStatement = path.value
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
