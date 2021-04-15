import { TSPropertySignature } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSPropertySignatureMatcher(
  query: TSPropertySignature,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.key.type === 'Identifier') {
    if (
      !query.optional &&
      !query.computed &&
      (query.typeAnnotation == null ||
        query.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureMatcher = compileCaptureMatcher(
        query.key.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.key.name = unescapeIdentifier(query.key.name)
  }
}
