import { Node, NodePath } from '../types'
import { NodePath as ASTPath } from 'ast-types/lib/node-path'
import * as t from 'ast-types'

export default class RecastNodePath<T = Node> implements NodePath<T> {
  wrapped: ASTPath<T>

  constructor(wrapped: ASTPath<T>) {
    this.wrapped = wrapped
  }

  static _cache: WeakMap<ASTPath<any>, NodePath<any>> = new WeakMap()

  static wrap<T = Node>(original: ASTPath<T>): NodePath<T> {
    let path: NodePath<any> = RecastNodePath._cache.get(original) as any
    if (path) return path
    path = new RecastNodePath(original) as any
    RecastNodePath._cache.set(original, path)
    return path
  }

  get node(): T {
    return this.wrapped.value as any
  }

  get container(): Node | Node[] {
    const { parentPath } = this.wrapped
    if (parentPath && Array.isArray(parentPath.value)) return parentPath.value
    return this.isNode() ? (this as any).node : parentPath.value
  }

  get key(): string | number | undefined {
    return this.wrapped.name
  }

  get listKey(): string | number | undefined {
    return Array.isArray(this.container)
      ? this.wrapped.parentPath?.name
      : undefined
  }

  get parentPath(): NodePath | undefined {
    const { parentPath } = this.wrapped
    if (!parentPath) return undefined
    if (Array.isArray(parentPath.value)) {
      return RecastNodePath.wrap(parentPath.parentPath)
    }
    return RecastNodePath.wrap(parentPath)
  }

  insertBefore(nodes: T | Node | readonly T[] | readonly Node[]): void {
    if (Array.isArray(nodes)) {
      this.wrapped.insertBefore(...nodes)
    } else {
      this.wrapped.insertBefore(nodes)
    }
  }

  remove(): void {
    this.wrapped.prune()
  }
  replaceWith(replacement: T | Node | NodePath): void {
    this.wrapped.replace(
      replacement instanceof RecastNodePath
        ? (replacement as any).node
        : (replacement as any)
    )
  }
  replaceWithMultiple(
    replacement: T[] | Node[] | NodePath<T>[] | NodePath[]
  ): void {
    this.insertBefore(
      replacement.map((r) => (r instanceof RecastNodePath ? r.node : r))
    )
    this.remove()
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
    const path = this.wrapped.get(key)
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
