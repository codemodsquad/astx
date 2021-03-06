import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './'
import indentDebug from './indentDebug'

export default function compileGenericArrayMatcher(
  query: ASTNode[],
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const elemMatchers: CompiledMatcher[] = query.map((queryElem) =>
    compileMatcher(queryElem, {
      ...compileOptions,
      debug: indentDebug(debug, 2),
    })
  )
  return {
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      let captures: MatchResult = null

      debug('Array')
      if (!Array.isArray(path.value)) {
        debug('  path.value is not an array')
        return null
      }
      if (path.value.length !== query.length) {
        debug(
          '  path.value.length (%d) !== query.length (%d)',
          path.value.length,
          query.length
        )
        return null
      }
      for (let i = 0; i < elemMatchers.length; i++) {
        debug('  [%d]', i)
        const result = elemMatchers[i].match(path.get(i), matchSoFar)
        if (!result) return null
        captures = mergeCaptures(captures, result)
        matchSoFar = mergeCaptures(matchSoFar, result)
      }
      return captures || {}
    },
  }
}
