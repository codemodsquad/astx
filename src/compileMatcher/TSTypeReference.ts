import { TSTypeReference } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeReferenceMatcher(
  query: TSTypeReference,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.typeName.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        query.typeName.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.typeName.name = unescapeIdentifier(query.typeName.name)
  }
}
