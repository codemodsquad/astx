import { Node } from '../types'
import { original, source } from './symbols'

export function cloneAstWithOriginals<T extends Node>(ast: T, src: string): T {
  const clones: Map<Node, Node> = new Map()

  function cloneNode<T extends Node>(node: T): T {
    const clone = clones.get(node)
    if (clone) return clone as any

    const result: any = { [original]: node, [source]: src }
    for (const field in node) {
      result[field] = cloneValue((node as any)[field])
    }
    clones.set(node, result)
    return result
  }

  function cloneValue<T>(value: T): T {
    if (Array.isArray(value)) {
      return (value as any).map(cloneValue)
    }
    if (value instanceof Object) {
      const obj: Record<string, any> = value
      if (typeof obj.type === 'string') {
        return cloneNode(value as any)
      }
      const result: any = {}
      for (const key in obj) {
        result[key] = cloneValue(obj[key])
      }
      return result
    }
    return value
  }

  return cloneNode(ast)
}
