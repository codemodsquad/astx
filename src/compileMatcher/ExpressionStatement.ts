import { ExpressionStatement } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileExpressionStatementMatcher(
  query: ExpressionStatement,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      query.expression.name,
      compileOptions
    )
    if (captureMatcher) return captureMatcher
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
