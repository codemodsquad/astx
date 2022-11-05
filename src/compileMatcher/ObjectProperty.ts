import { ObjectProperty, NodePath, NodeType } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher from './Capture'
import indentDebug from './indentDebug'

const nodeTypes: NodeType[] = ['ObjectProperty']

export default function compileObjectPropertyMatcher(
  path: NodePath<ObjectProperty, ObjectProperty>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { debug } = compileOptions
  const n = compileOptions.backend.t.namedTypes
  const subCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  }
  const pattern: ObjectProperty = path.value

  if (n.AssignmentPattern.check(pattern.value)) {
    return compileMatcher(path.get('value'), compileOptions)
  }
  if (n.Identifier.check(pattern.key)) {
    if (pattern.shorthand && !pattern.computed) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions,
        { nodeType: 'ObjectMember' }
      )

      if (captureMatcher) return captureMatcher
    }
  }
  if (!pattern.computed) {
    const keyMatcher = compileMatcher(path.get('key'), subCompileOptions)
    const valueMatcher = compileMatcher(path.get('value'), subCompileOptions)
    return {
      pattern: path,
      nodeType: nodeTypes,
      match: (_path: NodePath, matchSoFar: MatchResult): MatchResult => {
        const { value: node } = _path
        if (!nodeTypes.includes(node.type)) {
          debug(`wrong node type`)
          return null
        }
        const path: NodePath<ObjectProperty> = _path as NodePath<any>
        debug('key')
        matchSoFar = keyMatcher.match(path.get('key'), matchSoFar)
        if (!matchSoFar) return null
        debug('value')
        return valueMatcher.match(path.get('value'), matchSoFar)
      },
    }
  }
}
