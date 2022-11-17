import { ExportSpecifier, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileExportSpecifierReplacement(
  path: NodePath<ExportSpecifier, ExportSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern = path.value
  const { exportKind, exported, local } = pattern as any
  if (
    n.Identifier.check(exported) &&
    (!local || local.name === exported.name)
  ) {
    if (exportKind == null || exportKind === 'value') {
      const placeholderReplacement = compilePlaceholderReplacement(
        path,
        exported.name,
        compileOptions
      )
      if (placeholderReplacement) return placeholderReplacement
    }
  }
}
