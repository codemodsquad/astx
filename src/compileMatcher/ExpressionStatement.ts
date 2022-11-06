import { ExpressionStatement, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileExpressionStatementMatcher(
  path: NodePath<ExpressionStatement, ExpressionStatement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ExpressionStatement = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.expression)) {
    const placeholderMatcher = compilePlaceholderMatcher(
      path,
      pattern.expression.name,
      compileOptions,
      { nodeType: 'Statement' }
    )

    if (placeholderMatcher) return placeholderMatcher
  }
}
