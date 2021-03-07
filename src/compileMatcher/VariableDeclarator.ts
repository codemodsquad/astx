import { VariableDeclarator } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileVariableDeclaratorMatcher(
  query: VariableDeclarator,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.id.type === 'Identifier') {
    if (query.init == null) {
      const captureMatcher = compileCaptureMatcher(
        query.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.id.name = unescapeIdentifier(query.id.name)
  }
}
