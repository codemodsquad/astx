import { TypeParameter, NodePath, setAstxMatchInfo } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compilePlaceholderMatcher from './Placeholder'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileTypeParameterMatcher(
  path: NodePath<TypeParameter, TypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TypeParameter = path.value

  const placeholderMatcher = compilePlaceholderMatcher(
    path,
    pattern.name,
    compileOptions,
    { nodeType: 'TypeParameter' }
  )

  if (placeholderMatcher) {
    if (pattern.variance == null && pattern.bound == null) {
      return placeholderMatcher
    }

    const { placeholder } = placeholderMatcher

    const genericMatcher = compileGenericNodeMatcher(path, compileOptions, {
      keyMatchers: { name: placeholderMatcher },
    })

    return {
      ...genericMatcher,

      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        matchSoFar = genericMatcher.match(path, matchSoFar)

        if (matchSoFar == null) return null

        const captured = placeholder ? matchSoFar.captures?.[placeholder] : null

        if (captured) {
          setAstxMatchInfo(captured.node, {
            subcapture: {
              type: 'TypeParameter',
              name: (captured.node as TypeParameter).name,
            },
          })
        }

        return matchSoFar
      },
    }
  }
}
