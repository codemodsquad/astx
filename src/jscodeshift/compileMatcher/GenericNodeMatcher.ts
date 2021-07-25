import {
  ASTNode,
  ASTPath,
  getFieldNames,
  getFieldValue,
  NodeType,
  isType,
} from '../variant'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import indentDebug from './indentDebug'

import { CompiledArrayMatcher } from './'

import getChildPathsArray from '../variant/getChildPathsArray'

const equivalenceClassesArray: {
  nodeTypes: Set<ASTNode['type']>
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
  Record<
    ASTNode['type'],
    { nodeTypes: Set<ASTNode['type']>; baseType?: NodeType }
  >
> = {}
for (const klass of equivalenceClassesArray) {
  for (const type of klass.nodeTypes) equivalenceClasses[type] = klass
}

export default function compileGenericNodeMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions,
  options?: {
    keyMatchers?: Record<string, CompiledMatcher | CompiledArrayMatcher>
  }
): CompiledMatcher {
  const pattern: ASTNode = path.node

  const { baseType, nodeTypes } = equivalenceClasses[pattern.type] || {}

  const nodeType =
    baseType || (nodeTypes ? [...nodeTypes] : null) || pattern.type
  const isCorrectType = baseType
    ? (node: ASTNode) => isType(node, baseType)
    : nodeTypes
    ? (node: ASTNode) => nodeTypes.has(node.type)
    : (node: ASTNode) => node.type === pattern.type

  const { debug } = compileOptions

  const keyMatchers: Record<
    string,
    CompiledMatcher | CompiledArrayMatcher
  > = Object.fromEntries(
    getFieldNames(pattern)
      .filter((key) => key !== 'type')
      .map((key: string): [string, CompiledMatcher | CompiledArrayMatcher] => {
        const custom = options?.keyMatchers?.[key]

        if (custom) return [key, custom]

        const value = getFieldValue(pattern, key as any)

        if (typeof value !== 'object' || value == null) {
          return [
            key,
            {
              match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
                const nodeValue = getFieldValue(path.node, key as any)

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
            compileMatcher(getChildPathsArray(path, key) as any, {
              ...compileOptions,
              debug: indentDebug(debug, 2),
            }),
          ]
        }
      })
  )

  return {
    match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
      debug('%s (generic)', pattern.type)

      if (isCorrectType(path.node)) {
        for (const key in keyMatchers) {
          debug('  .%s', key)
          const matcher = keyMatchers[key]
          matchSoFar = matcher.match(
            getChildPathsArray(path, key as any) as any,
            matchSoFar
          )

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
