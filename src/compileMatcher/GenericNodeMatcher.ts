import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
} from './index'
import t from 'ast-types'
import indentDebug from './indentDebug'

function isCompatibleType(path: ASTPath<any>, query: ASTNode): boolean {
  if (t.namedTypes.Function.check(query)) {
    return t.namedTypes.Function.check(path.node)
  }
  switch (query.type) {
    case 'ClassDeclaration':
    case 'ClassExpression':
      return (
        path.node.type === 'ClassDeclaration' ||
        path.node.type === 'ClassExpression'
      )
  }
  return false
}

type GenericNodeMatcherOptions = {
  nodeType?: CompiledMatcher['nodeType']
  keyMatchers?: Record<string, CompiledMatcher>
}

export default function compileGenericNodeMatcher(
  query: ASTNode,
  compileOptions: CompileOptions,
  options?: GenericNodeMatcherOptions
): CompiledMatcher {
  const nodeType = options?.nodeType || query.type
  const { debug } = compileOptions
  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    t
      .getFieldNames(query)
      .filter((key) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const override = options?.keyMatchers?.[key]
        if (override) return [key, override]
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
      if (path.node?.type === query.type || isCompatibleType(path, query)) {
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
