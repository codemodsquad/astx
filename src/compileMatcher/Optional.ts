import { ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from './'

export default function compileOptionalMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matcher = compileMatcher(path, compileOptions)
  return {
    ...matcher,
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      if (path.value == null) return matchSoFar || {}
      return matcher.match(path, matchSoFar)
    },
  }
}
