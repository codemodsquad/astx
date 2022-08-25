import { TSExpressionWithTypeArguments, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileTSExpressionWithTypeArgumentsMatcher(
  path: NodePath<TSExpressionWithTypeArguments>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSExpressionWithTypeArguments = path.node

  if (pattern.expression.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.expression.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
