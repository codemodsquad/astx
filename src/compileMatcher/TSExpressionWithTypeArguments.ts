import { TSExpressionWithTypeArguments } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileTSExpressionWithTypeArgumentsMatcher(
  query: TSExpressionWithTypeArguments,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  if (query.expression.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        query.expression.name,
        compileOptions
      )
      if (captureMatcher) return captureMatcher
    }
    query.expression.name = unescapeIdentifier(query.expression.name)
  }
}
