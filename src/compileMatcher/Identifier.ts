import { ASTPath, Identifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions, MatchResult } from './'

export default function compileIdentifierMatcher(
  query: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  return (path: ASTPath): MatchResult => {
    debug('identifier', query.name)
    const captureMatch = /^\$[a-z0-9]+/i.exec(query.name)
    if (captureMatch) {
      const whereCondition = compileOptions?.where?.[captureMatch[0]]
      if (whereCondition && !whereCondition(path)) {
        debug('  where condition returned false')
        return null
      }
      debug('  captured as %s', captureMatch[0])
      return { captures: { [captureMatch[0]]: path } }
    } else {
      if (
        path.node?.type === 'Identifier' &&
        path.node.name === query.name.replace(/^\$\$/g, '$')
      ) {
        debug('  matched')
        return {}
      } else {
        debug(`  didn't match`)
        return null
      }
    }
  }
}
