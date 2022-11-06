import { TSExpressionWithTypeArguments, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher from './Placeholder'

export default function compileTSExpressionWithTypeArgumentsMatcher(
  path: NodePath<TSExpressionWithTypeArguments, TSExpressionWithTypeArguments>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSExpressionWithTypeArguments = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.expression)) {
    if (pattern.typeParameters == null) {
      const placeholderMatcher = compilePlaceholderMatcher(
        path,
        pattern.expression.name,
        compileOptions,
        { nodeType: 'TSExpressionWithTypeArguments' }
      )

      if (placeholderMatcher) return placeholderMatcher
    }
  }
}
