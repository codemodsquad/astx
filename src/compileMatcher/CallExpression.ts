import { NodePath, CallExpression } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileCallExpressionMatcher(
  path: NodePath<CallExpression>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { callee } = path.node

  if (callee.type === 'Identifier') {
    const special = compileSpecialMatcher(
      path,
      callee.name,
      path.get('arguments'),
      compileOptions
    )

    if (special) return special
  }
}
