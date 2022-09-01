import { ImportSpecifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileImportSpecifierReplacement(
  path: NodePath<ImportSpecifier, ImportSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  const { importKind, imported, local } = pattern as any
  if (
    n.Identifier.check(imported) &&
    (!local || local.name === imported.name)
  ) {
    if (importKind == null || importKind === 'value') {
      const captureReplacement = compileCaptureReplacement(
        path,
        imported.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
