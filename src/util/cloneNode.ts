import { Comment, Node } from '../types'
import { original, source } from './symbols'

const commentClones: Map<Comment, Comment> = new Map()

function isComment(node: any): node is Comment {
  return node.type === 'CommentLine' || node.type === 'CommentBlock'
}

export default function cloneNode<T extends Node>(node: T): T {
  if (isComment(node)) {
    const clone = commentClones.get(node)
    if (clone && (node as Comment).value === clone.value) return clone as any
  }
  const result: any = {
    [original]: (node as any)[original],
    [source]: (node as any)[source],
  }
  for (const field in node) {
    switch (field) {
      case 'start':
      case 'end':
      case 'loc':
      case 'range':
        continue
    }
    const value = (node as any)[field]
    result[field] = cloneValue(value)
  }
  if (isComment(node)) {
    commentClones.set(node, result)
  }
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
