import { GenericTypeAnnotation } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileIdentifierMatcher from './Identifier'

export default function compileGenericTypeAnnotationMatcher(
  query: GenericTypeAnnotation,
  compileOptions: CompileOptions
): CompiledMatcher {
  if (query.id.type === 'Identifier' && query.typeParameters == null) {
    const match = /^\$[a-z0-9]+/i.exec(query.id.name)
    if (match) return compileIdentifierMatcher(query.id, compileOptions)
  }
  return compileGenericNodeMatcher(query, compileOptions)
}
