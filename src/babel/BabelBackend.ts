import { Node, File, Statement, Expression } from '@babel/types'
import { Backend } from '../backend/Backend'
import * as defaultParser from '@babel/parser'
import { ParserOptions } from '@babel/parser'
import * as defaultTypes from '@babel/types'
import defaultGenerate from '@babel/generator'
import * as AstTypes from 'ast-types'
import babelAstTypes from './babelAstTypes'
import { Comment, Location } from '../types'

interface Parser {
  parse(code: string, parserOpts?: ParserOptions): File
  parseExpression(code: string, parserOpts?: ParserOptions): Expression
}

type Generate = (node: Node) => { code: string }

export default class BabelBackend extends Backend<Node> {
  readonly t: typeof AstTypes
  readonly parse: (code: string) => Node
  readonly parseExpression: (code: string) => Expression
  readonly parseStatements: (code: string) => Statement[]
  readonly generate: Generate
  readonly location: (node: Node) => Location
  readonly comments: (
    node: Node,
    kind?: 'leading' | 'inner' | 'trailing'
  ) => Iterable<Comment>

  constructor({
    parser = defaultParser,
    parserOptions,
    generate = defaultGenerate,
    types = defaultTypes,
  }: {
    parser?: Parser
    parserOptions?: ParserOptions
    generate?: Generate
    types?: typeof defaultTypes
  } = {}) {
    super()

    const t = babelAstTypes(types)

    this.t = t
    this.parse = (code: string) => parser.parse(code, parserOptions)
    this.parseExpression = (code: string) =>
      parser.parseExpression(code, parserOptions)
    this.parseStatements = (code: string) => {
      const ast = this.parse(code)
      if (ast.type !== 'File') {
        throw new Error(`failed to get File node`)
      }
      return ast.program.body
    }
    this.generate = generate
    this.location = (node: Node) => ({
      start: node.start,
      end: node.end,
      startLine: node.loc?.start?.line,
      startColumn: node.loc?.start?.column,
      endLine: node.loc?.end?.line,
      endColumn: node.loc?.end?.column,
    })
    this.comments = function* comments(
      node: Node,
      kind?: 'leading' | 'inner' | 'trailing'
    ): Iterable<Comment> {
      if (!kind || kind === 'leading') {
        const { leadingComments } = node
        if (leadingComments) yield* leadingComments
      }
      if (!kind || kind === 'inner') {
        const { innerComments } = node
        if (innerComments) yield* innerComments
      }
      if (!kind || kind === 'trailing') {
        const { trailingComments } = node
        if (trailingComments) yield* trailingComments
      }
    }
  }
}
