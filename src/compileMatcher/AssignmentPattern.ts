import { NodePath, AssignmentPattern, pathIs } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import indentDebug from './indentDebug'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileAssignmentPatternMatcher(
  pattern: NodePath<AssignmentPattern, AssignmentPattern>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const n = compileOptions.backend.t.namedTypes
  const subCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  }

  const left = pattern.get('left')
  const right = pattern.get('right')
  const rightMatcher = compileMatcher(right, subCompileOptions)
  if (rightMatcher.optional) {
    const leftMatcher = compileMatcher(left, subCompileOptions)
    const wholeMatcher = compileGenericNodeMatcher(pattern, subCompileOptions)
    return {
      pattern,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        debug('AssignmentPattern (with optional right)')
        return (
          pathIs(path, n.AssignmentPattern) ? wholeMatcher : leftMatcher
        ).match(path, matchSoFar)
      },
    }
  }
}
