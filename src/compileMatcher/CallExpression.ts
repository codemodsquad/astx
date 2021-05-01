import { CallExpression, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'

import compileOrMatcher from './Or'

import compileAndMatcher from './And'

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
      case '$Or':
        if (args.length < 2) {
          throw new Error(`$Or must be called with at least 2 arguments`)
        }
        return compileOrMatcher(
          path.get('arguments').filter(() => true),
          compileOptions
        )
      case '$And':
        if (args.length < 2) {
          throw new Error(`$And must be called with at least 2 arguments`)
        }
        return compileAndMatcher(
          path.get('arguments').filter(() => true),
          compileOptions
        )
    }
  }
}
