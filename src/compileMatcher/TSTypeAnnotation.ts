import { TSTypeAnnotation, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileTSTypeAnnotationMatcher(
  path: NodePath<TSTypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const typeAnnotation = path.get('typeAnnotation')
  if (!compileOptions.backend.hasNode(typeAnnotation)) return
  const annotationMatcher = compileMatcher(typeAnnotation, compileOptions)

  if (annotationMatcher.optional) {
    return {
      type: 'node',
      pattern: path,
      nodeType: 'TSTypeAnnotation',
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
