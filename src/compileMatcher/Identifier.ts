import { Identifier, NodePath } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileIdentifierMatcher(
  path: NodePath<Identifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: Identifier = path.node
  const { hasNode } = compileOptions.backend

  const typeAnnotation = path.get('typeAnnotation')

  const captureMatcher = compileCaptureMatcher(
    path,
    pattern.name,
    compileOptions
  )

  if (captureMatcher) {
    const { captureAs } = captureMatcher

    if (typeAnnotation && hasNode(typeAnnotation)) {
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

          const typeAnnotation = path.get('typeAnnotation')
          return Array.isArray(typeAnnotation)
            ? null
            : typeAnnotationMatcher.match(typeAnnotation, matchSoFar)
        },
      }
    }

    return captureMatcher
  }

  pattern.name = unescapeIdentifier(pattern.name)
}
