import { ASTPath, ASTNode } from 'jscodeshift'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
} from './index'
import { Match } from '../find'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericArrayReplacement(
  path: ASTPath<any[]> | ASTPath[],
  compileOptions: CompileReplacementOptions
): CompiledReplacement {
  const elemPaths: ASTPath[] = Array.isArray(path)
    ? path
    : path.value.map((value: any, i: number) => path.get(i))
  const { debug } = compileOptions

  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const elemReplacements = elemPaths.map((elemPath: ASTPath) =>
    compileReplacement(elemPath, elemOptions)
  )

  return {
    generate: (match: Match): ASTNode | ASTNode[] => {
      const result: ASTNode[] = []
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
