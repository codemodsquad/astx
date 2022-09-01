import { Node, NodePath, NodeType } from '../types'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import indentDebug from './indentDebug'
import areFieldValuesEqual from '../util/areFieldValuesEqual'

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
  path: NodePath<Node, Node>,
  compileOptions: CompileOptions,
  options?: {
    keyMatchers?: Record<string, CompiledMatcher>
  }
): CompiledMatcher {
  const {
    backend: { t },
  } = compileOptions

  const pattern: Node = path.node

  const { baseType, nodeTypes } =
    equivalenceClasses[pattern.type as NodeType] || {}

  const nodeType =
    baseType ||
    (nodeTypes ? [...nodeTypes] : null) ||
    (pattern.type as NodeType)
  const isType = baseType
    ? (node: any) => (t.namedTypes as any)[baseType]?.check(node)
    : null
  const isCorrectType = isType
    ? (node: Node) => isType(node)
    : nodeTypes
    ? (node: Node) => nodeTypes.has(node?.type as NodeType)
    : (node: Node) => node?.type === pattern.type

  const { debug } = compileOptions

  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    t
      .getFieldNames(pattern)
      // .filter((key: string) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const custom = options?.keyMatchers?.[key]

        if (custom) return [key, custom]

        const value = t.getFieldValue(pattern, key)
        const fieldPath = path.get(key)

        if (Array.isArray(value) || fieldPath.node === value) {
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
              pattern: fieldPath,
              match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
                const nodeValue = t.getFieldValue(path.node, key)

                if (areFieldValuesEqual(t, value, nodeValue)) {
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
              pattern: fieldPath,
              match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
                const nodeValue = t.getFieldValue(path.node, key)

                if (
                  value === nodeValue ||
                  (value === null && nodeValue === false) ||
                  (value === false && nodeValue === null)
                ) {
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
    pattern: path,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('%s (generic)', pattern.type)

      if (Array.isArray(path.value)) return null

      if (isCorrectType(path?.value)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          matchSoFar = matcher.match(path.get(key), matchSoFar)
          if (!matchSoFar) return null
        }

        return matchSoFar || {}
      } else {
        debug(
          '  path?.value?.type (%s) is not compatible with pattern.type (%s)',
          path?.value?.type,
          pattern.type
        )

        return null
      }
    },

    nodeType,
  }
}
