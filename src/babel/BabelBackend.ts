import { Node, File, Statement, Expression } from '@babel/types'
import { Backend } from '../backend/Backend'
import { ParserOptions } from '@babel/parser'
import * as defaultParser from '@babel/parser'
import * as defaultTypes from '@babel/types'
import * as defaultGenerator from '@babel/generator'
import type * as AstTypes from 'ast-types'
import babelAstTypes from './babelAstTypes'
import { Comment, Location } from '../types'
import reprint from './reprint'
import detectChangedNodes from '../util/detectChangedNodes'
import { cloneAstWithOriginals } from '../util/cloneAstWithOriginals'
import babelInterop from './babelInterop'

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
  readonly generator: typeof defaultGenerator
  readonly generate: Generate
  readonly location: (node: Node) => Location
  readonly comments: (
    node: Node,
    kind?: 'leading' | 'inner' | 'trailing'
  ) => Iterable<Comment>

  constructor({
    parser = babelInterop(defaultParser),
    parserOptions,
    generator = babelInterop(defaultGenerator),
    types = babelInterop(defaultTypes),
    preserveFormat,
  }: {
    parser?: Parser
    parserOptions?: ParserOptions
    generator?: typeof defaultGenerator
    types?: typeof defaultTypes
    preserveFormat?: 'generatorHack'
  } = {}) {
    super()

    if (typeof generator.default !== 'function') {
      throw new Error(`typeof generator.default should === 'function'`)
    }

    const t = babelAstTypes(types)

    this.t = t
    this.parse = (code: string) =>
      cloneAstWithOriginals(parser.parse(code, parserOptions), code)
    this.parseExpression = (code: string) =>
      parser.parseExpression(code, parserOptions)
    this.parseStatements = (code: string) => {
      const ast = this.parse(code)
      if (ast.type !== 'File') {
        throw new Error(`failed to get File node`)
      }
      return ast.program.body
    }
    this.generator = generator
    this.generate =
      preserveFormat === 'generatorHack'
        ? (node: Node) => {
            if (node.type !== 'File') return generator.default(node)
            detectChangedNodes(this.t, new t.NodePath(node))
            return reprint(this.generator, node)
          }
        : generator.default
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

  removeComments(node: Node): void {
    delete node.leadingComments
    delete node.trailingComments
    delete node.innerComments
  }
}
