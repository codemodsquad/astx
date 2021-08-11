import { ImportDefaultSpecifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileImportDefaultSpecifierReplacement(
  path: ASTPath<ImportDefaultSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { local } = pattern
  if (local != null) {
    if ((pattern as any).importKind == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        local.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
