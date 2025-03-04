import { CallExpression, NodePath } from '../types'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileRelativeSourceReplacement from './RelativeSource'
import * as t from '@babel/types'

export default function compileCallExpressionReplacement(
  path: NodePath<CallExpression, CallExpression>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.value
  const n = compileOptions.backend.t.namedTypes
  if (n.Import.check(pattern.callee)) {
    const sourceReplacement = compileRelativeSourceReplacement(
      path.get('arguments').get(0),
      compileOptions
    )
    if (sourceReplacement) {
      return {
        generate: (match, options) =>
          t.callExpression(t.import(), [
            sourceReplacement.generate(match, options) as t.StringLiteral,
          ]),
      }
    }
  }
}
