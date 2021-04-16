// Eventually, the plan is to move all references to jscodeshift into this file.
// Then, I'll move everything in src to src/jscodeshift, and make a separate
// src/babel directory with variant.ts that hooks up to the babel API.  Build scripts
// will keep the rest of the files in sync.
// Haven't worked out what I'll do about node types from Flow parser though.

import t from 'ast-types'
import j, {
  ASTNode,
  ASTPath,
  Expression,
  Statement,
  Collection,
  JSCodeshift,
  Parser,
} from 'jscodeshift'
import shallowEqual from 'shallowequal'

import Astx, { GetReplacement } from './Astx'
import { CompiledMatcher } from './compileMatcher'
import { ReplaceOptions } from './replace'

export * from 'ast-types/gen/nodes'
export * from 'ast-types/gen/builders'

type NodeTypes = typeof t.namedTypes

export type NodeType = keyof NodeTypes

export type Node = ASTNode
export type NodePath<N = Node> = ASTPath<N>
export type Root = Collection | ASTPath<any>

function normalizeRoot(root: Root): Collection {
  return (root as any).node instanceof Object ? j([root]) : root
}

export function visit(
  root: Root,
  visitors: { [K in keyof NodeTypes]?: (path: NodePath<NodeTypes[K]>) => void }
): void {
  const collection = normalizeRoot(root)
  for (const [nodeType, visitor] of Object.entries(visitors)) {
    if (!visitor) continue
    collection.find(j[nodeType]).forEach(visitor)
  }
}

export function findStatementArrayPaths(root: Root): NodePath<Statement[]>[] {
  const result: NodePath[] = []
  root.find(j.Statement).forEach((path: NodePath) => {
    const { parentPath } = path
    if (Array.isArray(parentPath.value) && parentPath.value[0] === path.node)
      result.push(parentPath)
  })
  return result
}

function addFieldNames(type: ASTNode['type'], ...fields: string[]): string[] {
  const fieldNames = t.getFieldNames({ type })
  for (const field of fields) {
    if (!fieldNames.includes(field)) fieldNames.push(field)
  }
  return fieldNames
}

const arrayPattern = addFieldNames('ArrayPattern', 'typeAnnotation')
const objectPattern = addFieldNames('ObjectPattern', 'typeAnnotation')
const callExpression = addFieldNames('CallExpression', 'typeAnnotation')

export function getFieldNames(node: ASTNode): string[] {
  switch (node.type) {
    case 'ArrayPattern':
      return arrayPattern
    case 'ObjectPattern':
      return objectPattern
    case 'CallExpression':
      return callExpression
    default:
      return t.getFieldNames(node)
  }
}

export function areASTsEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type === 'File')
    return b.type === 'File' && areFieldValuesEqual(a.program, b.program)
  if (a.type !== b.type) return false
  const nodeFields = getFieldNames(a)
  for (const name of nodeFields) {
    if (
      !areFieldValuesEqual(t.getFieldValue(a, name), t.getFieldValue(b, name))
    )
      return false
  }
  return true
}

function areFieldValuesEqual(a: any, b: any): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || b.length !== a.length) return false
    return a.every((value, index) => areFieldValuesEqual(value, b[index]))
  } else if (t.namedTypes.Node.check(a)) {
    return t.namedTypes.Node.check(b) && areASTsEqual(a as any, b as any)
  } else {
    return shallowEqual(a, b)
  }
}

export type TransformOptions = {
  /** The absolute path to the current file. */
  path: string
  /** The source code of the current file. */
  source: string
  root: Root
  astx: Astx
  expression(strings: TemplateStringsArray, ...quasis: any[]): Expression
  statement(strings: TemplateStringsArray, ...quasis: any[]): Statement
  statements(strings: TemplateStringsArray, ...quasis: any[]): Statement[]
  j: JSCodeshift
  jscodeshift: JSCodeshift
  report: (msg: string) => void
}

export type Transform = {
  astx?: (options: TransformOptions) => Root | string | null | undefined | void
  parser?: string | Parser
  find?: string | ASTNode | CompiledMatcher | CompiledMatcher[]
  replace?: string | GetReplacement<any>
  where?: ReplaceOptions['where']
}

export function isStatement(node: Expression | ASTNode): boolean {
  return t.namedTypes.Statement.check(node)
}
