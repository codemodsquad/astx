import t from 'ast-types'
import j, { ExpressionStatement, ASTNode, Statement } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export function convertCaptureToStatement(capture: ASTNode): Statement {
  switch (capture.type) {
    case 'ClassExpression':
      return { ...capture, type: 'ClassDeclaration' }
    case 'FunctionExpression':
      return { ...capture, type: 'FunctionDeclaration' }
  }
  if (t.namedTypes.Statement.check(capture)) return capture
  if (t.namedTypes.Expression.check(capture))
    return j.expressionStatement(capture)
  throw new Error(`converting ${capture.type} to Statement isn't supported`)
}

const captureOptions = {
  convertCapture: convertCaptureToStatement,
}

export default function compileExpressionStatementReplacement(
  query: ExpressionStatement,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<Statement | ASTNode[]> | void {
  if (query.expression.type === 'Identifier') {
    const captureReplacement = compileCaptureReplacement(
      query,
      query.expression.name,
      compileOptions,
      captureOptions
    )
    if (captureReplacement) return captureReplacement
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
