import { NodePath, Node } from '../types'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
} from './index'
import { Match } from '../find'
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
    generate: (match: Match): Node | Node[] => {
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
