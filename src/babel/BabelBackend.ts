import { Node } from '@babel/types'
import { Statement, Expression } from '../types'
import { Backend } from '../backend/Backend'
import * as defaultParser from '@babel/parser'
import { ParserOptions } from '@babel/parser'
import * as defaultTypes from '@babel/types'
import defaultGenerate from '@babel/generator'
import * as AstTypes from 'ast-types'
import babelAstTypes from './babelAstTypes'

export default class BabelBackend extends Backend<Node> {
  t: typeof AstTypes
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]

  constructor({
    parser = defaultParser,
    parserOptions,
    generate = defaultGenerate,
    types = defaultTypes,
  }: {
    parser?: typeof defaultParser
    parserOptions?: ParserOptions
    generate?: typeof defaultGenerate
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
    this.sourceRange = (node: Node) => [node.start, node.end]
  }
}
