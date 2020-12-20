import { ASTNode, ASTPath } from 'jscodeshift'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  Captures,
} from './index'
import t from 'ast-types'
import indentDebug from './indentDebug'

function isCompatibleType(path: ASTPath<any>, query: ASTNode): boolean {
  if (t.namedTypes.Function.check(query)) {
    return t.namedTypes.Function.check(path.node)
  }
  return false
}

export default function compileGenericNodeMatcher(
  query: ASTNode,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const keyMatchers: Record<string, CompiledMatcher> = Object.fromEntries(
    t
      .getFieldNames(query)
      .filter((key) => key !== 'type')
      .map((key: string): [string, CompiledMatcher] => {
        const value = (query as any)[key]
        if (typeof value !== 'object' || value == null) {
          return [
            key,
            (path: ASTPath<any>): MatchResult => {
              if (value !== path.node[key]) {
                debug('    %s !== %s', value, path.node[key])
                return null
              } else {
                debug('    %s === %s', value, path.node[key])
                return {}
              }
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

  return (path: ASTPath<any>): MatchResult => {
    let captures: Captures | undefined

    debug('%s (generic)', query.type)
    if (path.node?.type === query.type || isCompatibleType(path, query)) {
      for (const key in keyMatchers) {
        debug('  .%s', key)
        const matcher = keyMatchers[key]
        const result = matcher(path.get(key))
        if (!result) return null
        if (result.captures) {
          if (!captures) captures = {}
          Object.assign(captures, result.captures)
        }
      }
      return { captures }
    } else {
      debug(
        '  path.node?.type (%s) is not compatible with query.type (%s)',
        path.node?.type,
        query.type
      )
      return null
    }
  }
}
