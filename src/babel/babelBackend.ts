import { Node, NodeType, NodePath, Statement, Expression } from '../types'
import { Backend } from '../Backend'
import * as defaultParser from '@babel/parser'
import { ParserOptions } from '@babel/parser'
import * as defaultTemplate from '@babel/template'
import * as defaultTypes from '@babel/types'
import defaultGenerate from '@babel/generator'
import defaultTraverse, {
  Visitor,
  NodePath as BabelNodePath,
} from '@babel/traverse'
import shallowEqual from 'shallowequal'

export default function babelBackend({
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
} = {}): Backend {
  function getFieldNames(nodeType: string): string[] {
    return Object.keys(t.NODE_FIELDS[nodeType])
  }

  function validatorDefaultValue(validate: any): any {
    switch (validate.type) {
      case 'boolean':
        return false
      case 'array':
        return []
    }
    if (validate.chainOf) {
      for (const el of validate.chainOf) {
        const def = validatorDefaultValue(el)
        if (def) return def
      }
    }
  }

  function defaultFieldValue(nodeType: string, field: string): any {
    return (t.NODE_FIELDS[nodeType] as any)?.[field]?.default
    // const def = (t.NODE_FIELDS[nodeType] as any)?.[field]
    // if (!def) return undefined
    // if (def.default != null) return def.default
    // return validatorDefaultValue(def.validate)
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
      if (!areFieldValuesEqual(getFieldValue(a, name), getFieldValue(b, name)))
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

  return {
    parse: (code: string) => parser.parse(code, parserOptions),
    template: {
      expression: (code: string): Expression =>
        template.expression(code, templateOptions)(),
      statements: (code: string): Statement[] =>
        template.statements(code, templateOptions)(),
      smart: (code: string) => {
        try {
          return template.expression(code, templateOptions)()
        } catch (error) {
          return template.smart(code, {
            ...parserOptions,
            syntacticPlaceholders: true,
            preserveComments: true,
          })()
        }
      },
    },
    generate: (node: Node): { code: string } => {
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
    },
    rootPath: (node: Node): NodePath => {
      const origNode = node.type === 'File' ? node.program : node
      if (node.type !== 'File') {
        if (t.isExpression(node)) {
          node = t.expressionStatement(node as any)
        }
        node = t.file(t.program([node as any]))
      }
      let root: NodePath | undefined
      traverse(node as any, {
        enter(path: BabelNodePath) {
          if (path.node === origNode) {
            root = path as any
            path.stop()
          }
        },
      })
      if (!root) throw new Error(`failed to get root path`)
      return root
    },
    getFieldNames,
    defaultFieldValue,
    areASTsEqual,
    areFieldValuesEqual,
    isStatement: (node: any): node is Statement => t.isStatement(node),
    forEachNode: (
      paths: NodePath[],
      nodeTypes: NodeType[],
      iteratee: (path: NodePath) => void
    ): void => {
      const visited = new Set()
      function visitNode(path: NodePath) {
        if (visited.has(path.node)) return
        visited.add(path.node)
        iteratee(path)
      }
      const visitor: Visitor = {}
      for (const nodeType of nodeTypes) {
        ;(visitor as any)[nodeType === 'Node' ? 'enter' : nodeType] = visitNode
      }
      paths.forEach((path: NodePath) => path.traverse(visitor))
    },
    isTypeFns: Object.fromEntries(
      [...Object.entries(t)]
        .filter(([key]) => /^is[A-Z]/.test(key))
        .map(([key, value]) => [key.substring(2), value])
    ) as any,
    hasNode: <T = any>(path: NodePath<T>): path is NodePath<NonNullable<T>> =>
      t.isNode(path.node),
  }
}
