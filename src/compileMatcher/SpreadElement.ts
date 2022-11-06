import { NodePath, SpreadElement } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileSpreadElementMatcher(
  path: NodePath<SpreadElement, SpreadElement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const n = compileOptions.backend.t.namedTypes
  const { argument } = path.value
  if (n.Identifier.check(argument)) {
    const capture = compilePlaceholderMatcher(
      path,
      argument.name,
      compileOptions,
      {
        nodeType: 'ObjectMember',
      }
    )
    if (capture) {
      const restPlaceholder =
        capture.arrayPlaceholder || capture.restPlaceholder
      if (restPlaceholder) {
        return {
          pattern: path,
          restPlaceholder,
          match: (): MatchResult => {
            throw new Error(
              `rest capture placeholder ${restPlaceholder} is in an invalid position`
            )
          },
        }
      }
    }
  }
}
