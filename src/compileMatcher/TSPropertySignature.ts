import { TSPropertySignature } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSPropertySignatureMatcher(
  pattern: TSPropertySignature,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        pattern.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureMatcher = compileCaptureMatcher(
        pattern.key.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.key.name = unescapeIdentifier(pattern.key.name)
  }
}
