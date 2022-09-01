import { NodePath, CallExpression } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileCallExpressionMatcher(
  path: NodePath<CallExpression, CallExpression>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { callee } = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(callee)) {
    const special = compileSpecialMatcher(
      path,
      callee.name,
      path.get('arguments'),
      compileOptions
    )

    if (special) return special
  }
}
