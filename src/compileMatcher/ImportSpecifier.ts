import { ImportSpecifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'
import convertToJSXIdentifierName from '../convertReplacement/convertToJSXIdentifierName'

export default function compileImportSpecifierMatcher(
  path: NodePath<ImportSpecifier, ImportSpecifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ImportSpecifier = path.value

  const { importKind } = pattern as any
  const importedName = convertToJSXIdentifierName(pattern.imported)
  if (importedName && (!pattern.local || pattern.local.name === importedName)) {
    if (importKind == null || importKind === 'value') {
      const captureMatcher = compileCaptureMatcher(
        path,
        importedName,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
