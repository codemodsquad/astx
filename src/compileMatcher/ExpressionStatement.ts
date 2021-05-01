import { ExpressionStatement, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileExpressionStatementMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ExpressionStatement = path.node
  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      pattern.expression.name,
      compileOptions
    )
    if (captureMatcher) return captureMatcher
    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
