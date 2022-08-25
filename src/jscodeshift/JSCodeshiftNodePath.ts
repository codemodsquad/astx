import { Node, NodePath } from '../types'
import * as t from 'ast-types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'

export default class JSCodeshiftNodePath<T = Node> implements NodePath<T> {
  original: ASTPath<T>

  constructor(original: ASTPath<T>) {
    this.original = original
  }

  static wrap<T = Node>(original: ASTPath<T>): NodePath<T> {
    return new JSCodeshiftNodePath(original) as any
  }

  get node(): T {
    return this.original.value as any
  }

  get container(): Node | Node[] {
    const { parentPath } = this.original
    if (parentPath && Array.isArray(parentPath.value)) return parentPath.value
    return this.isNode() ? (this as any).node : parentPath.value
  }

  get key(): string | number | undefined {
    return this.original.name
  }

  get listKey(): string | number | undefined {
    return Array.isArray(this.container)
      ? this.original.parentPath?.name
      : undefined
  }

  get parentPath(): NodePath | undefined {
    const { parentPath } = this.original
    if (!parentPath) return undefined
    if (Array.isArray(parentPath.value)) {
      return JSCodeshiftNodePath.wrap(parentPath.parentPath)
    }
    return JSCodeshiftNodePath.wrap(parentPath)
  }

  get<K extends keyof T>(
    key: K
  ): T[K] extends Array<Node | null | undefined>
    ? Array<NodePath<T[K][number]>>
    : T[K] extends Array<Node | null | undefined> | null | undefined
    ? Array<NodePath<NonNullable<T[K]>[number]>> | NodePath<null | undefined>
    : T[K] extends Node | null | undefined
    ? NodePath<T[K]>
    : never
  get(key: string | number): NodePath | NodePath[] {
    const path = this.original.get(key)
    if (Array.isArray(path.value)) {
      return path.filter(() => true).map(JSCodeshiftNodePath.wrap)
    } else {
      return JSCodeshiftNodePath.wrap(path) as any
    }
  }

  hasNode(): this is NodePath<NonNullable<T>> {
    return this.node != null
  }
  isNode(): this is NodePath<Node> {
    return t.namedTypes.Node.check(this.node)
  }
}
