import { CallExpression, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'

export default function compileCallExpressionMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { callee, arguments: args }: CallExpression = path.node
  if (callee.type === 'Identifier') {
    switch (callee.name) {
      case '$Optional': {
        if (args.length !== 1) {
          throw new Error(`$Optional must be called with 1 argument`)
        }
        return compileOptionalMatcher(
          path.get('arguments').get(0),
          compileOptions
        )
      }
    }
  }
}
