import { Identifier, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions, MatchResult } from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileIdentifierMatcher(
  pattern: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { typeAnnotation } = pattern
  const captureMatcher = compileCaptureMatcher(pattern.name, compileOptions)
  if (captureMatcher) {
    const { captureAs } = captureMatcher
    if (typeAnnotation) {
      const typeAnnotationMatcher = compileGenericNodeMatcher(
        typeAnnotation,
        compileOptions
      )
      return {
        ...captureMatcher,
        match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
          matchSoFar = captureMatcher.match(path, matchSoFar)
          if (matchSoFar == null) return null
          const captured = captureAs ? matchSoFar.captures?.[captureAs] : null
          if (captured)
            captured.node.astx = { excludeTypeAnnotationFromCapture: true }
          const typeAnnotation = path.get('typeAnnotation')
          if (!typeAnnotation) return null
          return typeAnnotationMatcher.match(typeAnnotation, matchSoFar)
        },
      }
    }
    return captureMatcher
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
