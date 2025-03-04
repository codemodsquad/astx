import { NodePath, CallExpression } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileSpecialMatcher from './SpecialMatcher'
import { compileRelativeSourceMatcher } from './RelativeSource'

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
  if (n.Import.check(callee)) {
    const sourceMatcher = compileRelativeSourceMatcher(
      path.get('arguments').get(0),
      compileOptions
    )
    if (sourceMatcher) {
      return {
        pattern: path,
        match: (path, matchSoFar, options) => {
          const { value } = path
          if (
            value.type !== 'CallExpression' ||
            !n.Import.check(value.callee)
          ) {
            return null
          }
          return sourceMatcher.match(
            path.get('arguments').get(0),
            matchSoFar,
            options
          )
        },
      }
    }
  }
}
