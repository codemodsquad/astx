import { ImportSpecifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compilePlaceholderMatcher from './Placeholder'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileImportSpecifierMatcher(
  path: NodePath<ImportSpecifier, ImportSpecifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const n = compileOptions.backend.t.namedTypes
  const pattern: ImportSpecifier = path.value

  const importKind = (pattern as any).importKind || 'value'
  const { imported, local } = pattern
  if (
    n.Identifier.check(imported) &&
    (!local || local.name === imported.name)
  ) {
    if (importKind === 'value') {
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

  return compileGenericNodeMatcher(path, compileOptions, {
    keyMatchers: {
      importKind: {
        pattern: path.get('importKind'),
        match: (
          path: NodePath<any, any>,
          matchSoFar: MatchResult
        ): MatchResult => {
          return (path.value || 'value') === importKind
            ? matchSoFar || {}
            : null
        },
      },
    },
  })
}
