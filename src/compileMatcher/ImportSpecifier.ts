import { ImportSpecifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileImportSpecifierMatcher(
  path: NodePath<ImportSpecifier, ImportSpecifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern: ImportSpecifier = path.value

  const { importKind } = pattern as any
  const { imported, local } = pattern
  if (
    n.Identifier.check(imported) &&
    (!local || local.name === imported.name)
  ) {
    if (importKind == null || importKind === 'value') {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        imported.name,
        compileOptions,
        {
          nodeType: [
            'ImportSpecifier',
            'ImportDefaultSpecifier',
            'ImportNamespaceSpecifier',
          ],
        }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
