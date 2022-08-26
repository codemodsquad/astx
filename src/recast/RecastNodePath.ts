import { Node, NodePath } from '../types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import * as t from 'ast-types'

export default class RecastNodePath<T = Node> implements NodePath<T> {
  original: ASTPath<T>

  constructor(original: ASTPath<T>) {
    this.original = original
  }

  static wrap<T = Node>(original: ASTPath<T>): NodePath<T> {
    return new RecastNodePath(original) as any
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
      return RecastNodePath.wrap(parentPath.parentPath)
    }
    return RecastNodePath.wrap(parentPath)
  }

  insertBefore(nodes: Node | readonly Node[]): void {
    if (Array.isArray(nodes)) {
      this.original.insertBefore(...nodes)
    } else {
      this.original.insertBefore(nodes)
    }
  }

  remove(): void {
    this.original.prune()
  }
  replaceWith(replacement: Node | NodePath): void {
    this.original.replace(
      replacement instanceof RecastNodePath
        ? (replacement as any).node
        : (replacement as any)
    )
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
  get(key: string | number): NodePath<any> | NodePath<any>[] {
    const path = this.original.get(key)
    if (Array.isArray(path.value)) {
      return path.filter(() => true).map(RecastNodePath.wrap)
    } else {
      return RecastNodePath.wrap(path) as any
    }
  }

  hasNode(): this is NodePath<NonNullable<T>> {
    return this.node != null
  }
  isNode(): this is NodePath<Node> {
    return t.namedTypes.Node.check(this.node)
  }
}
