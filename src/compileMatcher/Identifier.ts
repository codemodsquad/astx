import { ASTPath, Identifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions, PredicateMatcher } from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileIdentifierMatcher(
  query: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher | PredicateMatcher {
  const { debug } = compileOptions
  if (query.typeAnnotation != null)
    return compileGenericNodeMatcher(query, compileOptions)
  const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
  if (captureMatcher) return captureMatcher
  const name = unescapeIdentifier(query.name)
  return {
    predicate: true,
    match: (path: ASTPath): boolean => {
      debug('Identifier', name)
      if (path.node?.type !== 'Identifier') {
        debug(`  node is a %s`, path.node?.type)
        return false
      } else if (path.node.name === name) {
        debug('  %s === %s', path.node.name, name)
        return true
      } else {
        debug(`  %s !== %s`, path.node.name, name)
        return false
      }
    },
    nodeType: 'Identifier',
  }
}
