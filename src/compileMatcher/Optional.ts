import { NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from '.'

export default function compileOptionalMatcher(
  path: NodePath,
  subpath: NodePath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matcher = compileMatcher(subpath, compileOptions)

  return {
    ...matcher,
    pattern: path,
    optional: true,

    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      if (path.value == null) return matchSoFar || {}

      return matcher.match(path, matchSoFar)
    },
  }
}
