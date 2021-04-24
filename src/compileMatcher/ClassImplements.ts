import { ClassImplements } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileClassImplementsMatcher(
  pattern: ClassImplements,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.id.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
