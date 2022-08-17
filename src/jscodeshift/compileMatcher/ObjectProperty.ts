import { ObjectProperty, ASTPath } from 'jscodeshift'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher from './Capture'

export default function compileObjectPropertyMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ObjectProperty = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      pattern.shorthand &&
      !pattern.computed &&
      pattern.accessibility == null
    ) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
  if (!pattern.computed) {
    const keyMatcher = compileMatcher(path.get('key'), compileOptions)
    const valueMatcher = compileMatcher(path.get('value'), compileOptions)
    return {
      pattern: path,
      nodeType: ['Property', 'ObjectProperty'],
      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        const { node } = path
        if (node.type !== 'Property' && node.type !== 'ObjectProperty')
          return null
        matchSoFar = keyMatcher.match(path.get('key'), matchSoFar)
        if (!matchSoFar) return null
        return valueMatcher.match(path.get('value'), matchSoFar)
      },
    }
  }
}
