import { NodePath, Node } from '../types'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
  GenerateReplacementOptions,
  ReplaceableMatch,
} from './index'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericArrayReplacement(
  path: NodePath<Node, Node>[] | NodePath<Node, Node[]>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement {
  const { debug } = compileOptions
  const paths = path.filter(() => true)

  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const elemReplacements = paths.map((elemPath) =>
    compileReplacement(elemPath, elemOptions)
  )

  return {
    generate: (
      match: ReplaceableMatch,
      options: GenerateReplacementOptions
    ): Node | Node[] => {
      const result: Node[] = []
      for (const elem of elemReplacements) {
        const replacement = elem.generate(match, options)
        if (Array.isArray(replacement)) {
          replacement.forEach((elem) => result.push(elem))
        } else {
          result.push(replacement)
        }
      }
      return result
    },
  }
}
