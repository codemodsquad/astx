import { ExportNamedDeclaration, NodePath, Node, StringLiteral } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  GenerateReplacementOptions,
  ReplaceableMatch,
} from '.'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import transferComments from '../util/transferComments'
import compileRelativeSourceReplacement from './RelativeSource'

export default function compileExportNamedDeclarationReplacement(
  path: NodePath<ExportNamedDeclaration, ExportNamedDeclaration>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const n = compileOptions.backend.t.namedTypes
  const replacement = compileGenericNodeReplacement(path, compileOptions)

  const sourceReplacement = compileRelativeSourceReplacement(
    path.get('source'),
    compileOptions
  )

  return {
    generate: (
      match: ReplaceableMatch,
      options: GenerateReplacementOptions
    ): Node | Node[] => {
      const result: ExportNamedDeclaration = replacement.generate(
        match,
        options
      ) as any
      if (sourceReplacement) {
        result.source = sourceReplacement.generate(
          match,
          options
        ) as StringLiteral
      }
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
      transferComments(path.node, result)
      return result
    },
  }
}
