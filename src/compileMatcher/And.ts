import { NodePath } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import { NodeType } from '../types'
import indentDebug from './indentDebug'

export default function compileAndMatcher(
  path: NodePath,
  paths: NodePath[],
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const elemOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  }
  const matchers = paths.map((path) => compileMatcher(path, elemOptions))
  const nodeType: Set<NodeType> = new Set()
  for (const m of matchers) {
    if (Array.isArray(m.nodeType)) m.nodeType.forEach((t) => nodeType.add(t))
    else if (m.nodeType) nodeType.add(m.nodeType)
  }
  return {
    type: 'node',
    pattern: path,
    nodeType: nodeType.size ? [...nodeType] : undefined,
    optional: true,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('$And')
      for (const matcher of matchers) {
        matchSoFar = matcher.match(path, matchSoFar)
        if (!matchSoFar) return null
      }
      return matchSoFar
    },
  }
}
