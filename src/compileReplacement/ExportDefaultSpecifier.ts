import { ExportDefaultSpecifier, NodePath, ExportDeclaration } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compilePlaceholderReplacement from './Placeholder'

export default function compileExportDefaultSpecifierReplacement(
  path: NodePath<ExportDefaultSpecifier, ExportDefaultSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const { exported } = pattern
  if (exported != null) {
    const { exportKind } = (path.parentPath as NodePath<ExportDeclaration>)
      .node as any
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
