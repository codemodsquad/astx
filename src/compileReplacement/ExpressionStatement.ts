import { ExpressionStatement, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileExpressionStatementReplacement(
  path: NodePath<ExpressionStatement, ExpressionStatement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes
  if (n.Identifier.check(pattern.expression)) {
    const placeholderReplacement = compilePlaceholderReplacement(
      path,
      pattern.expression.name,
      compileOptions
    )
    if (placeholderReplacement) return placeholderReplacement
  }
}
