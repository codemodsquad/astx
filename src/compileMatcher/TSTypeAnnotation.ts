import { TSTypeAnnotation, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileTSTypeAnnotationMatcher(
  path: NodePath<TSTypeAnnotation, TSTypeAnnotation>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const typeAnnotation = path.get('typeAnnotation')
  if (!typeAnnotation.value) return
  const annotationMatcher = compileMatcher(typeAnnotation, compileOptions)

  if (annotationMatcher.optional) {
    return {
      pattern: path,
      nodeType: 'TSTypeAnnotation',
      optional: true,

      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (!path.value) return matchSoFar || {}

        return annotationMatcher.match(path.get('typeAnnotation'), matchSoFar)
      },
    }
  }
}
