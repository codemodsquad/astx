import { TSExpressionWithTypeArguments, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileTSExpressionWithTypeArgumentsReplacement(
  path: ASTPath<TSExpressionWithTypeArguments>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.expression.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.expression.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
