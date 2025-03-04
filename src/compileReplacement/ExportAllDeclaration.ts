import { ExportAllDeclaration, NodePath, Node, StringLiteral } from '../types'
import {
  CompiledReplacement,
  CompileReplacementOptions,
  GenerateReplacementOptions,
  ReplaceableMatch,
} from '.'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import transferComments from '../util/transferComments'
import compileRelativeSourceReplacement from './RelativeSource'

export default function compileExportAllDeclarationReplacement(
  path: NodePath<ExportAllDeclaration, ExportAllDeclaration>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
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
      const result: ExportAllDeclaration = replacement.generate(
        match,
        options
      ) as any
      if (sourceReplacement) {
        result.source = sourceReplacement.generate(
          match,
          options
        ) as StringLiteral
      }
      transferComments(path.node, result)
      return result
    },
  }
}
