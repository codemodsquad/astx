import { ImportDefaultSpecifier, NodePath, ImportDeclaration } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileImportDefaultSpecifierReplacement(
  path: NodePath<ImportDefaultSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { local } = pattern
  if (local != null) {
    const { importKind } = (path.parentPath as NodePath<ImportDeclaration>).node
    if (importKind == null || importKind === 'value') {
      const captureReplacement = compileCaptureReplacement(
        path,
        local.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
