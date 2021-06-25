import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import * as t from 'ast-types'
import indentDebug from './indentDebug'
import getFieldNames from '../util/getFieldNames'

const equivalenceClassesArray: {
  nodeTypes: Set<ASTNode['type']>
  baseType?: keyof typeof t.namedTypes
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
  Record<
    ASTNode['type'],
    { nodeTypes: Set<ASTNode['type']>; baseType?: keyof typeof t.namedTypes }
  >
> = {}
for (const klass of equivalenceClassesArray) {
  for (const type of klass.nodeTypes) equivalenceClasses[type] = klass
}

export default function compileGenericNodeMatcher(
  path: ASTPath,
  compileOptions: CompileOptions,
  options?: { keyMatchers?: Record<string, CompiledMatcher> }
): CompiledMatcher {
  const pattern: ASTNode = path.node
  const { baseType, nodeTypes } = equivalenceClasses[pattern.type] || {}
  const nodeType =
    baseType || (nodeTypes ? [...nodeTypes] : null) || pattern.type

  const namedType: any = baseType ? (t.namedTypes[baseType] as any) : null

  const isCorrectType = namedType
    ? (node: ASTNode) => namedType.check(node)
    : nodeTypes
    ? (node: ASTNode) => nodeTypes.has(node.type)
    : (node: ASTNode) => node.type === pattern.type

  const { debug } = compileOptions
  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    getFieldNames(pattern)
      .filter((key) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const custom = options?.keyMatchers?.[key]
        if (custom) return [key, custom]
        const value = t.getFieldValue(pattern, key)
        if (typeof value !== 'object' || value == null) {
          return [
            key,
            {
              match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
                const nodeValue = t.getFieldValue(path.node, key)
                if (value !== nodeValue) {
                  debug('    %s !== %s', value, nodeValue)
                  return null
                } else {
                  debug('    %s === %s', value, nodeValue)
                  return matchSoFar || {}
                }
              },
            },
          ]
        } else {
          return [
            key,
            compileMatcher(path.get(key), {
              ...compileOptions,
              debug: indentDebug(debug, 2),
            }),
          ]
        }
      })
  )

  return {
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      if (!path.value) return null
      debug('%s (generic)', pattern.type)
      if (isCorrectType(path.node)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          matchSoFar = matcher.match(path.get(key), matchSoFar)
          if (!matchSoFar) return null
        }
        return matchSoFar || {}
      } else {
        debug(
          '  path.node?.type (%s) is not compatible with pattern.type (%s)',
          path.node?.type,
          pattern.type
        )
        return null
      }
    },
    nodeType,
  }
}
