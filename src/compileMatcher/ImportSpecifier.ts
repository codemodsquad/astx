import { ImportSpecifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileImportSpecifierMatcher(
  query: ImportSpecifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (!query.local || query.local.name === query.imported.name) {
    if ((query as any).importKind == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        query.imported.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.imported.name = unescapeIdentifier(query.imported.name)
  }
}
