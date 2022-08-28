import { ImportDeclaration, NodePath, Node } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from '.'
import compileGenericNodeReplacement from './GenericNodeReplacement'

export default function compileImportDeclarationReplacement(
  path: NodePath<ImportDeclaration>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const replacement = compileGenericNodeReplacement(path, compileOptions)
  return {
    generate: (match: ReplaceableMatch): Node | Node[] => {
      const result: ImportDeclaration = replacement.generate(match) as any
      if (result.specifiers) {
        // move ImportDefaultSpecifier to beginning if necessary
        // because @babel/generator craps out otherwise
        const defaultIndex = result.specifiers.findIndex(
          (s) => s.type === 'ImportDefaultSpecifier'
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
