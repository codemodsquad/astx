import { Node, NodePath, NodeType } from '../types'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchOptions,
  MatchResult,
} from '.'

export default function compileOrMatcher(
  path: NodePath,
  paths: NodePath<Node, Node[]>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const matchers = paths.map((path) => compileMatcher(path, compileOptions))
  const nodeType: Set<NodeType> = new Set()
  for (const m of matchers) {
    if (Array.isArray(m.nodeType)) m.nodeType.forEach((t) => nodeType.add(t))
    else if (m.nodeType) nodeType.add(m.nodeType)
  }
  return {
    pattern: path,
    nodeType: nodeType.size ? [...nodeType] : undefined,
    match: (
      path: NodePath,
      matchSoFar: MatchResult,
      options: MatchOptions
    ): MatchResult => {
      for (const matcher of matchers) {
        const result = matcher.match(path, matchSoFar, options)
        if (result) return result
      }
      return null
    },
  }
}
