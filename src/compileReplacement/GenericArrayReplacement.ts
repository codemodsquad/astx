import { NodePath, Node } from '../types'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from './index'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericArrayReplacement(
  paths: NodePath[],
  compileOptions: CompileReplacementOptions
): CompiledReplacement {
  const { debug } = compileOptions

  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const elemReplacements = paths.map((elemPath) =>
    compileReplacement(elemPath, elemOptions)
  )

  return {
    generate: (match: ReplaceableMatch): Node | Node[] => {
      const result: Node[] = []
      for (const elem of elemReplacements) {
        const replacement = elem.generate(match)
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
