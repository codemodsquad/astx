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

export default class BabelBackend extends Backend<Node> {
  parse: (code: string) => Node
  parseExpression: (code: string) => Expression
  parseStatements: (code: string) => Statement[]
  generate: (node: Node) => { code: string }
  makePath: (node: Node) => NodePath
  isPath: (thing: any) => thing is NodePath
  sourceRange: (
    node: Node
  ) => [number | null | undefined, number | null | undefined]
  getFieldNames: (nodeType: string) => string[]
  defaultFieldValue: (nodeType: string, field: string) => any
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
    types: t = defaultTypes,
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

    function getFieldNames(nodeType: string): string[] {
      return Object.keys(t.NODE_FIELDS[nodeType])
    }

    function defaultFieldValue(nodeType: string, field: string): any {
      return (t.NODE_FIELDS[nodeType] as any)?.[field]?.default
    }

    function getFieldValue(node: any, field: string): any {
      const value = node[field]
      return value ?? defaultFieldValue(node.type, field)
    }

    function areASTsEqual(a: Node, b: Node): boolean {
      if (a.type === 'File')
        return b.type === 'File' && areFieldValuesEqual(a.program, b.program)
      if (a.type !== b.type) return false
      const nodeFields = getFieldNames(a.type)
      for (const name of nodeFields) {
        if (
          !areFieldValuesEqual(getFieldValue(a, name), getFieldValue(b, name))
        )
          return false
      }
      return true
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function areFieldValuesEqual(a: any, b: any): boolean {
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || b.length !== a.length) return false
        return a.every((value, index) => areFieldValuesEqual(value, b[index]))
      } else if (t.isNode(a)) {
        return t.isNode(b) && areASTsEqual(a as any, b as any)
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
      [...Object.entries(t)]
        .filter(([key]) => /^is[A-Z]/.test(key))
        .map(([key, value]) => [key.substring(2), value])
    ) as any
    this.parse = (code: string) => parser.parse(code, parserOptions)
    this.parseExpression = (code: string) =>
      template.expression(code, templateOptions)()
    this.parseStatements = (code: string) =>
      template.statements(code, templateOptions)()
    this.generate = (node: Node): { code: string } => {
      const { type, typeAnnotation, astx } = node as any
      if (
        typeAnnotation != null &&
        type !== 'TSPropertySignature' &&
        !astx?.excludeTypeAnnotationFromCapture
      ) {
        return {
          code: generate(node as any).code + generate(typeAnnotation).code,
        }
      }
      if (astx?.excludeTypeAnnotationFromCapture) {
        switch (node.type) {
          case 'TSPropertySignature':
            return generate(node.key as any)
        }
      }
      return generate(node as any)
    }
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
    this.getFieldNames = getFieldNames
    this.defaultFieldValue = defaultFieldValue
    this.areASTsEqual = areASTsEqual
    this.areFieldValuesEqual = areFieldValuesEqual
    this.isStatement = (node: any): node is Statement => t.isStatement(node)
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
        ;(path as BabelNodePath).original.traverse(visitor)
      })
    }
    this.isTypeFns = isTypeFns
    this.hasNode = <T = any>(
      path: NodePath<T>
    ): path is NodePath<NonNullable<T>> => t.isNode(path.node)
  }
}
