import { ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileTSTypeAnnotationMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const annotationMatcher = compileMatcher(
    path.get('typeAnnotation'),
    compileOptions
  )

  if (annotationMatcher.optional) {
    return {
      nodeType: 'TSTypeAnnotation',
      optional: true,

      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        if (!path.value) return matchSoFar || {}

        return annotationMatcher.match(path.get('typeAnnotation'), matchSoFar)
      },
    }
  }
}
