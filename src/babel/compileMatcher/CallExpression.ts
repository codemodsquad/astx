import { CallExpression, ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileSpecialMatcher from './SpecialMatcher'

import getChildPathsArray from '../variant/getChildPathsArray'

export default function compileCallExpressionMatcher(
  path: ASTPath<any>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { callee }: CallExpression = path.node

  if (callee.type === 'Identifier') {
    const special = compileSpecialMatcher(
      callee.name,
      getChildPathsArray(path, 'arguments'),
      compileOptions
    )

    if (special) return special
  }
}
