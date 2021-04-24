import { ASTNode, ASTPath } from 'jscodeshift'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
} from './index'
import { Match, StatementsMatch } from '../find'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericArrayReplacement<N extends ASTNode>(
  path: ASTPath<N[]> | ASTPath<N>[],
  compileOptions: CompileReplacementOptions
): CompiledReplacement<N[]> {
  const elemPaths = Array.isArray(path)
    ? path
    : path.value.map((value: any, i: number) => path.get(i))
  const { debug } = compileOptions

  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }
  const elemReplacements = elemPaths.map((elemPath) =>
    compileReplacement(elemPath, elemOptions)
  )

  return {
    generate: (match: Match<any> | StatementsMatch): N[] => {
      const result: N[] = []
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
