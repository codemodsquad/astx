import { ASTPath } from 'jscodeshift'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import { NodeType } from '../util/NodeType'
import indentDebug from './indentDebug'

export default function compileOrMatcher(
  path: ASTPath,
  paths: ASTPath[],
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
    pattern: path,
    nodeType: nodeType.size ? [...nodeType] : undefined,
    optional: true,
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      debug('$Or')
      for (const matcher of matchers) {
        const result = matcher.match(path, matchSoFar)
        if (result) return result
      }
      return null
    },
  }
}
