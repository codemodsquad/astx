import { Node, NodePath, NodeType } from '../types'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import indentDebug from './indentDebug'

const equivalenceClassesArray: {
  nodeTypes: Set<NodeType>
  baseType?: NodeType
}[] = [
  { nodeTypes: new Set(['ClassDeclaration', 'ClassExpression']) },
  {
    nodeTypes: new Set([
      'FunctionDeclaration',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'ObjectMethod',
      'ClassMethod',
      'ClassPrivateMethod',
    ]),
    baseType: 'Function',
  },
  {
    nodeTypes: new Set(['Identifier', 'JSXIdentifier']),
  },
]

const equivalenceClasses: Partial<
  Record<NodeType, { nodeTypes: Set<NodeType>; baseType?: NodeType }>
> = {}
for (const klass of equivalenceClassesArray) {
  for (const type of klass.nodeTypes) equivalenceClasses[type] = klass
}

export default function compileGenericNodeMatcher(
  path: NodePath,
  compileOptions: CompileOptions,
  options?: {
    keyMatchers?: Record<string, CompiledMatcher>
  }
): CompiledMatcher {
  const {
    backend: { t, areFieldValuesEqual, isTypeFns, hasNode },
  } = compileOptions

  const pattern: Node = path.node

  const { baseType, nodeTypes } =
    equivalenceClasses[pattern.type as NodeType] || {}

  const nodeType =
    baseType ||
    (nodeTypes ? [...nodeTypes] : null) ||
    (pattern.type as NodeType)
  const isType = baseType ? isTypeFns[baseType] : null
  const isCorrectType = isType
    ? (node: Node) => isType(node)
    : nodeTypes
    ? (node: Node) => nodeTypes.has(node?.type as NodeType)
    : (node: Node) => node?.type === pattern.type

  const { debug } = compileOptions

  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    t
      .getFieldNames(pattern)
      .filter((key: string) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const custom = options?.keyMatchers?.[key]

        if (custom) return [key, custom]

        const value = t.getFieldValue(pattern, key)
        const fieldPath = path.get(key)

        if (Array.isArray(fieldPath)) {
          return [
            key,
            compileMatcher(fieldPath, {
              ...compileOptions,
              debug: indentDebug(debug, 2),
            }),
          ]
        } else if (hasNode(fieldPath)) {
          return [
            key,
            compileMatcher(fieldPath, {
              ...compileOptions,
              debug: indentDebug(debug, 2),
            }),
          ]
        } else if (value instanceof Object) {
          return [
            key,
            {
              type: 'node',
              pattern: fieldPath,
              match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
                const { parentPath } = path
                if (!parentPath) return null
                const nodeValue =
                  path.node ?? t.getFieldValue(parentPath.node, key)

                if (areFieldValuesEqual(value, nodeValue)) {
                  debug('    %s === %s', value, nodeValue)
                  return matchSoFar || {}
                } else {
                  debug('    %s !== %s', value, nodeValue)
                  return null
                }
              },
            },
          ]
        } else {
          return [
            key,
            {
              type: 'node',
              pattern: fieldPath,
              match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
                const { parentPath } = path
                if (!parentPath) return null
                const nodeValue =
                  path.node ?? t.getFieldValue(parentPath.node, key)

                if (value === nodeValue) {
                  debug('    %s === %s', value, nodeValue)
                  return matchSoFar || {}
                } else {
                  debug('    %s !== %s', value, nodeValue)
                  return null
                }
              },
            },
          ]
        }
      })
  )

  return {
    type: 'node',
    pattern: path,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('%s (generic)', pattern.type)

      if (isCorrectType(path?.node)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          const subpath = path.get(key)
          if (matcher.type === 'array') {
            if (!Array.isArray(subpath)) return null
            matchSoFar = matcher.match(subpath, matchSoFar)
          } else {
            if (Array.isArray(subpath)) return null
            matchSoFar = matcher.match(subpath, matchSoFar)
          }

          if (!matchSoFar) return null
        }

        return matchSoFar || {}
      } else {
        debug(
          '  path?.node?.type (%s) is not compatible with pattern.type (%s)',
          path?.node?.type,
          pattern.type
        )

        return null
      }
    },

    nodeType,
  }
}
