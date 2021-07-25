import { ImportDefaultSpecifier, ASTPath } from '../variant'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

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
    local.name = unescapeIdentifier(local.name)
  }
}
