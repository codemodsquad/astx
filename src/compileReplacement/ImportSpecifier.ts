import { ImportSpecifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileImportSpecifierReplacement(
  path: NodePath<ImportSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (!pattern.local || pattern.local.name === pattern.imported.name) {
    if ((pattern as any).importKind == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.imported.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
