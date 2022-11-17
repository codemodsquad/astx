import { ExportSpecifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileExportSpecifierMatcher(
  path: NodePath<ExportSpecifier, ExportSpecifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern: ExportSpecifier = path.value

  const { exportKind } = pattern as any
  const { exported, local } = pattern
  if (
    n.Identifier.check(exported) &&
    (!local || local.name === exported.name)
  ) {
    if (exportKind == null || exportKind === 'value') {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        exported.name,
        compileOptions,
        {
          nodeType: [
            'ExportSpecifier',
            'ExportDefaultSpecifier',
            'ExportNamespaceSpecifier',
          ],
        }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
