import { ObjectProperty, NodePath, NodeType } from '../types'
import compileMatcher, {
  CompiledNodeMatcher,
  CompileOptions,
  MatchResult,
} from '.'
import compileCaptureMatcher from './Capture'
import indentDebug from './indentDebug'

const nodeTypes: NodeType[] = ['Property', 'ObjectProperty']

export default function compileObjectPropertyMatcher(
  path: NodePath<ObjectProperty>,
  compileOptions: CompileOptions
): CompiledNodeMatcher | void {
  const { debug } = compileOptions
  const subCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  }
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
    const keyMatcher = compileMatcher(path.get('key'), subCompileOptions)
    const valueMatcher = compileMatcher(path.get('value'), subCompileOptions)
    return {
      type: 'node',
      pattern: path,
      nodeType: nodeTypes,
      match: (_path: NodePath, matchSoFar: MatchResult): MatchResult => {
        const { node } = _path
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
