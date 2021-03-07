import { ASTPath, Identifier } from 'jscodeshift'
import areASTsEqual from '../util/areASTsEqual'
import { CompiledMatcher, CompileOptions, MatchResult, mergeCaptures } from './'

export default function compileIdentifierMatcher(
  query: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const captureName = /^\$[a-z0-9]+/i.exec(query.name)?.[0]
  if (captureName) {
    const whereCondition = compileOptions?.where?.[captureName]
    return {
      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        debug('Placeholder', query.name)
        const existingCapture = matchSoFar?.captures?.[captureName]
        if (existingCapture) {
          return areASTsEqual(existingCapture.node, path.node)
            ? matchSoFar || {}
            : null
        }
        if (whereCondition && !whereCondition(path)) {
          debug('  where condition returned false')
          return null
        }
        debug('  captured as %s', captureName)
        return mergeCaptures(matchSoFar, { captures: { [captureName]: path } })
      },
    }
  } else {
    const escaped = query.name.replace(/^\$\$/g, '$')
    return {
      match: (path: ASTPath, matchSoFar: MatchResult): MatchResult => {
        debug('Identifier', escaped)
        if (path.node?.type !== 'Identifier') {
          debug(`  node is a %s`, path.node?.type)
          return null
        } else if (path.node.name === escaped) {
          debug('  %s === %s', path.node.name, escaped)
          return matchSoFar || {}
        } else {
          debug(`  %s !== %s`, path.node.name, escaped)
          return null
        }
      },
      nodeType: 'Identifier',
    }
  }
}
