import t from 'ast-types'
import j, { ASTNode, ASTPath, Statement, Collection } from 'jscodeshift'
import shallowEqual from 'shallowequal'

export * from 'ast-types/gen/nodes'

export type NodeType = keyof typeof t.namedTypes

export type Node = ASTNode
export type NodePath<N = Node> = ASTPath<N>
export type Root = Collection

export function forEachNode(
  root: Root,
  nodeTypes: string | string[],
  iteratee: (path: NodePath) => void
): void {
  for (const nodeType of Array.isArray(nodeTypes) ? nodeTypes : [nodeTypes]) {
    root.find(j[nodeType]).forEach(iteratee)
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
