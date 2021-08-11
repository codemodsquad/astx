import { TSExpressionWithTypeArguments, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayCaptureMatcher from './Capture'

export default function compileTSExpressionWithTypeArgumentsMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSExpressionWithTypeArguments = path.node

  if (pattern.expression.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileArrayCaptureMatcher(
        pattern.expression.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
