import { SpreadElement, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import { compileArrayCaptureReplacement } from './Capture'

export default function compileSpreadElementReplacement(
  path: ASTPath<SpreadElement>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { argument } = pattern
  if (argument.type === 'Identifier') {
    const captureReplacement = compileArrayCaptureReplacement(
      path,
      argument.name,
      compileOptions
    )
    if (captureReplacement) return captureReplacement as any
  }
}
