import { ExpressionStatement, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileExpressionStatementReplacement(
  path: ASTPath<ExpressionStatement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.expression.type === 'Identifier') {
    const captureReplacement = compileCaptureReplacement(
      path,
      pattern.expression.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement
    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
