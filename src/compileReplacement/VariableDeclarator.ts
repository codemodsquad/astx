import { VariableDeclarator, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileVariableDeclaratorReplacement(
  query: VariableDeclarator,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<VariableDeclarator | ASTNode[]> | void {
  if (query.id.type === 'Identifier') {
    if (query.init == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.id.name = unescapeIdentifier(query.id.name)
  }
}
