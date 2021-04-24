import { TSExpressionWithTypeArguments } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSExpressionWithTypeArgumentsMatcher(
  pattern: TSExpressionWithTypeArguments,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (pattern.expression.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.expression.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    pattern.expression.name = unescapeIdentifier(pattern.expression.name)
  }
}
