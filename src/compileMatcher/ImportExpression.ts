import { ImportExpression, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import { compileRelativeSourceMatcher } from './RelativeSource'

export default function compileImportExpressionMatcher(
  path: NodePath<ImportExpression, ImportExpression>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const sourceMatcher = compileRelativeSourceMatcher(
    path.get('source'),
    compileOptions
  )

  return compileGenericNodeMatcher(path, compileOptions, {
    keyMatchers: {
      ...(sourceMatcher ? { source: sourceMatcher } : {}),
    },
  })
}
