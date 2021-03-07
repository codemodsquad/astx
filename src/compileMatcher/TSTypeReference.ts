import { TSTypeReference } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileIdentifierMatcher from './Identifier'

export default function compileTSTypeReferenceMatcher(
  query: TSTypeReference,
  compileOptions: CompileOptions
): CompiledMatcher {
  if (query.typeName.type === 'Identifier' && query.typeParameters == null) {
    const match = /^\$[a-z0-9]+/i.exec(query.typeName.name)
    if (match) return compileIdentifierMatcher(query.typeName, compileOptions)
  }
  return compileGenericNodeMatcher(query, compileOptions)
}
