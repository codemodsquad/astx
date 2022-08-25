import { NodePath, TypeAnnotation } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileTypeAnnotationMatcher(
  path: NodePath<TypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const annotationMatcher = compileMatcher(
    path.get('typeAnnotation'),
    compileOptions
  )

  if (annotationMatcher.optional) {
    return {
      type: 'node',
      pattern: path,
      nodeType: 'TypeAnnotation',
      optional: true,

      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (!path.node) return matchSoFar || {}
        const typeAnnotation = path.get('typeAnnotation')
        return Array.isArray(typeAnnotation)
          ? null
          : annotationMatcher.match(typeAnnotation, matchSoFar)
      },
    }
  }
}
