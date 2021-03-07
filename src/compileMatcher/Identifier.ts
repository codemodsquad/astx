import { ASTPath, Identifier } from 'jscodeshift'
import { CompiledMatcher, CompileOptions, NonCapturingMatcher } from './'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileIdentifierMatcher(
  query: Identifier,
  compileOptions: CompileOptions
): CompiledMatcher | NonCapturingMatcher {
  const { debug } = compileOptions
  const captureMatcher = compileCaptureMatcher(query.name, compileOptions)
  if (captureMatcher) return captureMatcher
  const name = unescapeIdentifier(query.name)
  return {
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
