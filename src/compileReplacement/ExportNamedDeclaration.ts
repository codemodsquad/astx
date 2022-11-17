import { ExportNamedDeclaration, NodePath, Node } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from '.'
import compileGenericNodeReplacement from './GenericNodeReplacement'

export default function compileExportNamedDeclarationReplacement(
  path: NodePath<ExportNamedDeclaration, ExportNamedDeclaration>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const replacement = compileGenericNodeReplacement(path, compileOptions)
  return {
    generate: (match: ReplaceableMatch): Node | Node[] => {
      const result: ExportNamedDeclaration = replacement.generate(match) as any
      if (result.specifiers) {
        // move ExportDefaultSpecifier to beginning if necessary
        // because @babel/generator craps out otherwise
        const defaultIndex = result.specifiers.findIndex((s) =>
          n.ExportDefaultSpecifier.check(s)
        )
        if (defaultIndex > 0) {
          result.specifiers.unshift(
            ...(result.specifiers.splice(defaultIndex, 1) as any)
          )
        }
      }
      return result
    },
  }
}
