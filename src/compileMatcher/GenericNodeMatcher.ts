import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import t, { Type } from 'ast-types'
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
  query: ASTNode,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { baseType, nodeTypes } = equivalenceClasses[query.type] || {}
  const nodeType = baseType || (nodeTypes ? [...nodeTypes] : null) || query.type

  const namedType: Type<any> = baseType ? (t.namedTypes[baseType] as any) : null

  const isCorrectType = namedType
    ? (node: ASTNode) => namedType.check(node)
    : nodeTypes
    ? (node: ASTNode) => nodeTypes.has(node.type)
    : (node: ASTNode) => node.type === query.type

  const { debug } = compileOptions
  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    getFieldNames(query)
      .filter((key) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const value = (query as any)[key]
        if (typeof value !== 'object' || value == null) {
          return [
            key,
            {
              match: (
                path: ASTPath<any>,
                matchSoFar: MatchResult
              ): MatchResult => {
                if (value !== path.node[key]) {
                  debug('    %s !== %s', value, path.node[key])
                  return null
                } else {
                  debug('    %s === %s', value, path.node[key])
                  return matchSoFar || {}
                }
              },
            },
          ]
        } else {
          return [
            key,
            compileMatcher(value, {
              ...compileOptions,
              debug: indentDebug(debug, 2),
            }),
          ]
        }
      })
  )

  return {
    match: (path: ASTPath<any>, matchSoFar: MatchResult): MatchResult => {
      debug('%s (generic)', query.type)
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
          '  path.node?.type (%s) is not compatible with query.type (%s)',
          path.node?.type,
          query.type
        )
        return null
      }
    },
    nodeType,
  }
}
