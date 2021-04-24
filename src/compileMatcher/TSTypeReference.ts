import { TSTypeReference } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSTypeReferenceMatcher(
  pattern: TSTypeReference,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.typeName.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.typeName.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.typeName.name = unescapeIdentifier(pattern.typeName.name)
  }
}
