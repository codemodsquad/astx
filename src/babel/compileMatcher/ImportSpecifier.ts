import { ImportSpecifier, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileImportSpecifierMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ImportSpecifier = path.node

  if (!pattern.local || pattern.local.name === pattern.imported.name) {
    if ((pattern as any).importKind == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.imported.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }

    pattern.imported.name = unescapeIdentifier(pattern.imported.name)
  }
}
