import { ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileMatcher, { MatchResult } from './'
import indentDebug from './indentDebug'

export default function compileOptionalMatcher(
  path: ASTPath<any>,
  subpath: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const matcher = compileMatcher(subpath, {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  })

  return {
    ...matcher,
    pattern: path,
    optional: true,

    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      debug('$Optional')
      if (path.value == null) {
        debug('  node not present')
        return matchSoFar || {}
      }

      return matcher.match(path, matchSoFar)
    },
  }
}
