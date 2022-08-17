import { ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from './'

export default function compileOptionalMatcher(
  path: ASTPath<any>,
  subpath: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matcher = compileMatcher(subpath, compileOptions)

  return {
    ...matcher,
    pattern: path,
    optional: true,

    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      if (path.value == null) return matchSoFar || {}

      return matcher.match(path, matchSoFar)
    },
  }
}
