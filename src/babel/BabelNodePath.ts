import { Node, NodePath } from '../types'
import { NodePath as _NodePath } from '@babel/traverse'
import * as t from '@babel/types'

export default class BabelNodePath<T = Node> implements NodePath<T> {
  wrapped: _NodePath<T>

  constructor(wrapped: _NodePath<T>) {
    this.wrapped = wrapped
  }

  static _cache: WeakMap<_NodePath<any>, NodePath<any>> = new WeakMap()

  static wrap<T = Node>(wrapped: _NodePath<T>): NodePath<T> {
    let path: NodePath<any> = BabelNodePath._cache.get(wrapped) as any
    if (path) return path
    path = new BabelNodePath(wrapped) as any
    BabelNodePath._cache.set(wrapped, path)
    return path
  }

  get node(): T {
    return this.wrapped.node
  }

  get container(): Node | Node[] {
    return this.wrapped.container as any
  }

  get key(): string | number | undefined {
    return this.wrapped.key
  }

  get listKey(): string | number | undefined {
    return this.wrapped.listKey
  }

  get parentPath(): NodePath | undefined {
    const { parentPath } = this.wrapped
    return parentPath ? BabelNodePath.wrap(parentPath) : undefined
  }

  insertBefore(nodes: T | Node | readonly T[] | readonly Node[]): void {
    this.wrapped.insertBefore(nodes as any)
  }

  remove(): void {
    this.wrapped.remove()
  }
  replaceWith(replacement: T | Node | NodePath): void {
    ;(this.wrapped as any)._removeFromScope()
    this.wrapped.replaceWith(replacement as any)
  }
  replaceWithMultiple(
    replacement: T[] | Node[] | NodePath<T>[] | NodePath[]
  ): void {
    ;(this.wrapped as any)._removeFromScope()
    this.wrapped.replaceWithMultiple(replacement as any)
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
    return this.wrapped.get(key as any) as any
  }

  hasNode(): this is NodePath<NonNullable<T>> {
    return this.node != null
  }
  isNode(): this is NodePath<Node> {
    return t.isNode(this.wrapped.node)
  }
}
