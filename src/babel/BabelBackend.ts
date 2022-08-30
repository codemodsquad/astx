import { Node } from '@babel/types'
import { NodeType, NodePath, Statement, Expression } from '../types'
import { Backend } from '../backend/Backend'
import * as defaultParser from '@babel/parser'
import { ParserOptions } from '@babel/parser'
import * as defaultTemplate from '@babel/template'
import * as defaultTypes from '@babel/types'
import defaultGenerate from '@babel/generator'
import * as defaultTraverse from '@babel/traverse'
import shallowEqual from 'shallowequal'
import BabelNodePath from './BabelNodePath'
import * as AstTypes from 'ast-types'
import babelAstTypes from './babelAstTypes'

export default class BabelBackend extends Backend<Node> {
  t: typeof AstTypes
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  makePath: (node: Node) => NodePath
  isPath: (thing: any) => thing is NodePath
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
  areASTsEqual: (a: Node, b: Node) => boolean
  areFieldValuesEqual: (a: any, b: any) => boolean
  isStatement: (node: any) => node is Statement
  forEachNode: (
    paths: NodePath[],
    nodeTypes: NodeType[],
    iteratee: (path: NodePath) => void
  ) => void
  isTypeFns: Record<string, (node: any) => boolean>
  hasNode: <T = Node>(path: NodePath<T>) => path is NodePath<NonNullable<T>>

  constructor({
    parser = defaultParser,
    parserOptions,
    template = defaultTemplate,
    generate = defaultGenerate,
    types = defaultTypes,
    traverse = defaultTraverse,
  }: {
    parser?: typeof defaultParser
    parserOptions?: ParserOptions
    template?: typeof defaultTemplate
    generate?: typeof defaultGenerate
    types?: typeof defaultTypes
    traverse?: typeof defaultTraverse
  } = {}) {
    super()

    const t = babelAstTypes(types)

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function areFieldValuesEqual(a: any, b: any): boolean {
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || b.length !== a.length) return false
        return a.every((value, index) => areFieldValuesEqual(value, b[index]))
      } else if (t.namedTypes.Node.check(a)) {
        return (
          t.namedTypes.Node.check(b) &&
          t.astNodesAreEquivalent(a as any, b as any)
        )
      } else {
        return shallowEqual(a, b)
      }
    }

    const templateOptions = {
      ...parserOptions,
      syntacticPlaceholders: true,
      preserveComments: true,
    }

    const isTypeFns = Object.fromEntries(
      [...Object.entries(types)]
        .filter(([key]) => /^is[A-Z]/.test(key))
        .map(([key, value]) => [key.substring(2), value])
    ) as any
    this.t = t
    this.parse = (code: string) => parser.parse(code, parserOptions)
    this.parseExpression = (code: string) =>
      template.expression(code, templateOptions)()
    this.parseStatements = (code: string) =>
      template.statements(code, templateOptions)()
    this.generate = generate
    this.makePath = (node: Node): NodePath => {
      if (node.type === 'File') {
        let program
        traverse.default(node, {
          Program(path: defaultTraverse.NodePath<defaultTypes.Program>) {
            program = path
            path.stop()
          },
        })
        if (!program) throw new Error(`failed to get program node`)
        return BabelNodePath.wrap(program)
      }
      // This is a big, big hack.
      // Babel seems designed to only start traversal
      // at the root File node.  But this works for now...
      return BabelNodePath.wrap(
        traverse.NodePath.get({
          hub: null as any,
          parent: node,
          container: { root: node } as any,
          key: 'root',
          parentPath: null,
        })
      )
    }
    this.isPath = (thing: any): thing is NodePath =>
      thing instanceof BabelNodePath
    this.sourceRange = (node: Node) => [node.start, node.end]
    this.areASTsEqual = t.astNodesAreEquivalent
    this.areFieldValuesEqual = areFieldValuesEqual
    this.isStatement = (node: any): node is Statement =>
      t.namedTypes.Statement.check(node)
    this.forEachNode = (
      paths: NodePath[],
      nodeTypes: NodeType[],
      iteratee: (path: NodePath) => void
    ): void => {
      const visited = new Set()
      function visitNode(path: defaultTraverse.NodePath) {
        if (visited.has(path.node)) return
        visited.add(path.node)
        iteratee(BabelNodePath.wrap(path))
      }
      const visitor: defaultTraverse.Visitor = { noScope: true } as any
      for (const nodeType of nodeTypes) {
        ;(visitor as any)[nodeType === 'Node' ? 'enter' : nodeType] = visitNode
      }
      paths.forEach((path: NodePath) => {
        for (const type of nodeTypes) {
          if (isTypeFns[type](path.node)) {
            if (visited.has(path.node)) return
            visited.add(path.node)
            iteratee(path)
          }
        }
        ;(path as BabelNodePath).wrapped.traverse(visitor)
      })
    }
    this.isTypeFns = isTypeFns
    this.hasNode = <T = any>(
      path: NodePath<T>
    ): path is NodePath<NonNullable<T>> => t.namedTypes.Node.check(path.node)
  }
}
