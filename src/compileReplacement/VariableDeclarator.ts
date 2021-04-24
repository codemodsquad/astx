import { VariableDeclarator, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileVariableDeclaratorReplacement(
  path: ASTPath<VariableDeclarator>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<VariableDeclarator | ASTNode[]> | void {
  const pattern = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.init == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
