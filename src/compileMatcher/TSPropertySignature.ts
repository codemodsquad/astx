import { TSPropertySignature, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSPropertySignatureMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSPropertySignature = path.node

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
