import { ASTPath } from 'jscodeshift'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import { NodeType } from '../util/NodeType'

export default function compileOrMatcher(
  paths: ASTPath[],
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matchers = paths.map((path) => compileMatcher(path, compileOptions))
  const nodeType: Set<NodeType> = new Set()
  for (const m of matchers) {
    if (Array.isArray(m.nodeType)) m.nodeType.forEach((t) => nodeType.add(t))
    else if (m.nodeType) nodeType.add(m.nodeType)
  }
  return {
    nodeType: nodeType.size ? [...nodeType] : undefined,
    optional: true,
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      for (const matcher of matchers) {
        const result = matcher.match(path, matchSoFar)
        if (result) return result
      }
      return null
    },
  }
}
