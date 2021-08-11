import { ExpressionStatement, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileExpressionStatementMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ExpressionStatement = path.node

  if (pattern.expression.type === 'Identifier') {
    const captureMatcher = compileCaptureMatcher(
      pattern.expression.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
