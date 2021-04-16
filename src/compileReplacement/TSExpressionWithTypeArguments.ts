import { TSExpressionWithTypeArguments, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSExpressionWithTypeArgumentsReplacement(
  query: TSExpressionWithTypeArguments,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TSExpressionWithTypeArguments | ASTNode[]> | void {
  if (query.expression.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.expression.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
