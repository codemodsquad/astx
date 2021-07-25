import { ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from './'

export default function compileOptionalMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matcher = compileMatcher(path, compileOptions)

  return {
    ...matcher,
    optional: true,

    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      if (path.value == null) return matchSoFar || {}

      return matcher.match(path, matchSoFar)
    },
  }
}
