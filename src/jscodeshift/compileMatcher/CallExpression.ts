import { CallExpression, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileSpecialMatcher from './SpecialMatcher'

export default function compileCallExpressionMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { callee }: CallExpression = path.node

  if (callee.type === 'Identifier') {
    const special = compileSpecialMatcher(
      path,
      callee.name,
      path.get('arguments').filter(() => true),
      compileOptions
    )

    if (special) return special
  }
}
