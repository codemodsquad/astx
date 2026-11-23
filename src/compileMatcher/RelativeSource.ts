import { CompiledMatcher, CompileOptions, MatchOptions, MatchResult } from '.'
import { NodePath } from '../types'
import Path from 'path'

export function compileRelativeSourceMatcher(
  pattern: NodePath<any>,
  compileOptions: Omit<CompileOptions, 'rootPath'>
): CompiledMatcher | void {
  const source = pattern.value
  const { getResolveAgainstDir } = compileOptions
  if (
    source.type === 'StringLiteral' &&
    source.value.startsWith('.') &&
    getResolveAgainstDir
  ) {
    const target = Path.resolve(getResolveAgainstDir(), source.value)
    return {
      pattern,
      match: (
        path: NodePath<any>,
        matchSoFar: MatchResult,
        { filename }: MatchOptions
      ): MatchResult => {
        const node = path.value
        if (node.type !== 'StringLiteral') return null
        return (
          filename
            ? target === Path.resolve(Path.dirname(filename), node.value)
            : node.value === source.value
        )
          ? matchSoFar || {}
          : null
      },
    }
  }
}
