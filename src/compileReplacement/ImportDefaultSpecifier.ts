import { ImportDefaultSpecifier, NodePath, ImportDeclaration } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileImportDefaultSpecifierReplacement(
  path: NodePath<ImportDefaultSpecifier, ImportDefaultSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const { local } = pattern
  if (local != null) {
    const { importKind } = (path.parentPath as NodePath<ImportDeclaration>).node
    if (importKind == null || importKind === 'value') {
      const captureReplacement = compilePlaceholderReplacement(
        path,
        local.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
