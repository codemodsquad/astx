import { TSTypeParameter, NodePath, setAstxMatchInfo } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compilePlaceholderMatcher from './Placeholder'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileTSTypeParameterMatcher(
  path: NodePath<TSTypeParameter, TSTypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSTypeParameter = path.value

  const placeholderMatcher = compilePlaceholderMatcher(
    path,
    pattern.name,
    compileOptions,
    { nodeType: 'TSTypeParameter' }
  )

  if (placeholderMatcher) {
    if (pattern.constraint == null && pattern.default == null) {
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
              type: 'TSTypeParameter',
              name: (captured.node as TSTypeParameter).name,
            },
          })
        }

        return matchSoFar
      },
    }
  }
}
