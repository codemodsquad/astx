import { Identifier, NodePath } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileIdentifierMatcher(
  path: NodePath<Identifier, Identifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: Identifier = path.value

  const typeAnnotation = path.get('typeAnnotation')

  const captureMatcher = compileCaptureMatcher(
    path,
    pattern.name,
    compileOptions
  )

  if (captureMatcher) {
    const { captureAs } = captureMatcher

    if (typeAnnotation && typeAnnotation.value) {
      const typeAnnotationMatcher = compileMatcher(
        typeAnnotation,
        compileOptions
      )

      return {
        ...captureMatcher,

        match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
          matchSoFar = captureMatcher.match(path, matchSoFar)

          if (matchSoFar == null) return null

          const captured = captureAs ? matchSoFar.captures?.[captureAs] : null

          if (captured) {
            ;(captured.node as any).astx = {
              excludeTypeAnnotationFromCapture: true,
            }
          }

          return typeAnnotationMatcher.match(
            path.get('typeAnnotation'),
            matchSoFar
          )
        },
      }
    }

    return captureMatcher
  }

  pattern.name = unescapeIdentifier(pattern.name)
}
