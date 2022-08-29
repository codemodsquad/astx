import { Node, NodePath } from '../types'
import { NodePath as _NodePath } from '@babel/traverse'
import * as t from '@babel/types'

export default class BabelNodePath<T = Node> implements NodePath<T> {
  original: _NodePath<T>

  constructor(original: _NodePath<T>) {
    this.original = original
  }

  static _cache: WeakMap<_NodePath<any>, NodePath<any>> = new WeakMap()

  static wrap<T = Node>(original: _NodePath<T>): NodePath<T> {
    let path: NodePath<any> = BabelNodePath._cache.get(original) as any
    if (path) return path
    path = new BabelNodePath(original) as any
    BabelNodePath._cache.set(original, path)
    return path
  }

  get node(): T {
    return this.original.node
  }

  get container(): Node | Node[] {
    return this.original.container as any
  }

  get key(): string | number | undefined {
    return this.original.key
  }

  get listKey(): string | number | undefined {
    return this.original.listKey
  }

  get parentPath(): NodePath | undefined {
    const { parentPath } = this.original
    return parentPath ? BabelNodePath.wrap(parentPath) : undefined
  }

  insertBefore(nodes: T | Node | readonly T[] | readonly Node[]): void {
    this.original.insertBefore(nodes as any)
  }

  remove(): void {
    this.original.remove()
  }
  replaceWith(replacement: T | Node | NodePath): void {
    ;(this.original as any)._removeFromScope()
    this.original.replaceWith(replacement as any)
  }
  replaceWithMultiple(
    replacement: T[] | Node[] | NodePath<T>[] | NodePath[]
  ): void {
    ;(this.original as any)._removeFromScope()
    this.original.replaceWithMultiple(replacement as any)
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
    return this.original.get(key as any) as any
  }

  hasNode(): this is NodePath<NonNullable<T>> {
    return this.node != null
  }
  isNode(): this is NodePath<Node> {
    return t.isNode(this.original.node)
  }
}
