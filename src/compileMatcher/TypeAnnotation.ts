import { NodePath, TypeAnnotation } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileTypeAnnotationMatcher(
  path: NodePath<TypeAnnotation, TypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const annotationMatcher = compileMatcher(
    path.get('typeAnnotation'),
    compileOptions
  )

  if (annotationMatcher.optional) {
    return {
      pattern: path,
      nodeType: 'TypeAnnotation',
      optional: true,

      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (!path.value) return matchSoFar || {}
        return annotationMatcher.match(path.get('typeAnnotation'), matchSoFar)
      },
    }
  }
}
