import { Statement, Expression } from '../types'
import { Backend } from '../backend/Backend'
import * as defaultRecast from 'recast'
import * as t from 'ast-types'
import fork from 'ast-types/fork'
import esProposalsDef from 'ast-types/def/es-proposals'
import jsxDef from 'ast-types/def/jsx'
import flowDef from 'ast-types/def/flow'
import esprimaDef from 'ast-types/def/esprima'
import babelDef from 'ast-types/def/babel'
import typescriptDef from 'ast-types/def/typescript'
import * as k from 'ast-types/gen/kinds'
import addMissingFields from './util/addMissingFields'

type Node = k.NodeKind

export default class RecastBackend extends Backend<Node> {
  t: typeof t
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]

  constructor({
    recast = defaultRecast,
    parseOptions,
  }: {
    recast?: typeof defaultRecast
    parseOptions?: defaultRecast.Options
  } = {}) {
    super()
    this.t = fork([
      // Feel free to add to or remove from this list of extension modules to
      // configure the precise type hierarchy that you need.
      esProposalsDef,
      jsxDef,
      flowDef,
      esprimaDef,
      babelDef,
      typescriptDef,
      addMissingFields,
    ])
    this.parse = (code: string) => recast.parse(code, parseOptions)
    this.parseStatements = (code: string): Statement[] => {
      const ast: k.FileKind = recast.parse(code, parseOptions)
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
    this.generate = (node: Node): { code: string } => recast.print(node)
    this.sourceRange = (node: Node) =>
      Array.isArray((node as any).range)
        ? (node as any).range
        : [(node as any).start, (node as any).end]
  }
}
