import { File, Statement, Expression, Location } from '../types'
import { Backend } from '../backend/Backend'
import * as defaultRecast from 'recast'
import * as t from 'ast-types'

export default class RecastBackend<Node = any> extends Backend<Node> {
  readonly wrapped: Backend
  readonly t: typeof t
  readonly parse: (code: string) => Node
  readonly parseExpression: (code: string) => Expression
  readonly parseStatements: (code: string) => Statement[]
  readonly generate: (node: Node) => { code: string }
  readonly location: (node: Node) => Location

  constructor({
    wrapped,
    recast = defaultRecast,
    parseOptions,
  }: {
    wrapped: Backend<Node>
    recast?: typeof defaultRecast
    parseOptions?: defaultRecast.Options
  }) {
    super()
    this.wrapped = wrapped
    this.t = wrapped.t
    parseOptions = { ...parseOptions, parser: wrapped }
    this.parse = (code: string) => recast.parse(code, parseOptions)
    this.parseStatements = (code: string): Statement[] => {
      const ast: File = recast.parse(code, parseOptions)
      const errors =
        ast.type === 'File' ? (ast.program as any).errors : (ast as any).errors
      if (errors?.length) {
        // Flow parser returns a bogus AST instead of throwing when the grammar is invalid,
        // but it at least includes parse errors in this array
        throw new Error(errors[0].message)
      }
      return ast.program.body
    }
    this.parseExpression = (code: string): Expression => {
      // wrap code in `(...)` to force evaluation as expression
      const statements = this.parseStatements(`(${code})`)
      let expression: Expression
      if (statements[0]?.type === 'ExpressionStatement') {
        expression = statements[0].expression
      } else {
        throw new Error(`invalid expression: ${code}`)
      }

      // Remove added parens
      if ((expression as any).extra) {
        ;(expression as any).extra.parenthesized = false
      }

      return expression
    }
    this.generate = (node: Node): { code: string } => recast.print(node as any)
    this.location = wrapped.location
  }
}
