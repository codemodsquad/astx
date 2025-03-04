import { ImportDeclaration, NodePath } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import { compileRelativeSourceMatcher } from './RelativeSource'

export default function compileImportSpecifierMatcher(
  path: NodePath<ImportDeclaration, ImportDeclaration>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ImportDeclaration = path.value

  const importKind = (pattern as any).importKind || 'value'

  const sourceMatcher = compileRelativeSourceMatcher(
    path.get('source'),
    compileOptions
  )

  return compileGenericNodeMatcher(path, compileOptions, {
    keyMatchers: {
      importKind: {
        pattern: path.get('importKind') as any,
        match: (
          path: NodePath<any, any>,
          matchSoFar: MatchResult
        ): MatchResult => {
          return (path.value || 'value') === importKind
            ? matchSoFar || {}
            : null
        },
      },
      ...(sourceMatcher ? { source: sourceMatcher } : {}),
    },
  })
}
