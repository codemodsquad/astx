import { ImportSpecifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileImportSpecifierReplacement(
  path: NodePath<ImportSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { importKind } = pattern as any
  if (!pattern.local || pattern.local.name === pattern.imported.name) {
    if (importKind == null || importKind === 'value') {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.imported.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
