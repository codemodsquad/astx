import { Identifier, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileIdentifierMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: Identifier = path.node
  const { typeAnnotation } = pattern
  const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
  if (captureMatcher) {
    const { captureAs } = captureMatcher
    if (typeAnnotation) {
      const typeAnnotationMatcher = compileMatcher(
        path.get('typeAnnotation'),
        compileOptions
      )
      return {
        ...captureMatcher,

        match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
          matchSoFar = captureMatcher.match(path, matchSoFar)
          if (matchSoFar == null) return null
          const captured = captureAs ? matchSoFar.captures?.[captureAs] : null
          if (captured)
            captured.node.astx = {
              excludeTypeAnnotationFromCapture: true,
            }
          const typeAnnotation = path.get('typeAnnotation')
          return typeAnnotationMatcher.match(typeAnnotation, matchSoFar)
        },
      }
    }
    return captureMatcher
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
