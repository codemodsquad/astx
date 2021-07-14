import { ASTNode } from '../variant'

export default function cloneNode<T extends ASTNode>(node: T): T {
  const result: any = {}
  for (const field in node) {
    switch (field) {
      case 'start':
      case 'end':
      case 'loc':
      case 'range':
      case 'extra':
        continue
    }
    const value = (node as any)[field]
    result[field] = cloneValue(value)
  }
  return result
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return (value as any).map(cloneValue)
  }
  if (value instanceof Object) {
    if (typeof (value as any).type === 'string') {
      return cloneNode(value as any)
    }
    const result: any = {}
    for (const key in value) {
      result[key] = cloneValue(value[key])
    }
    return result
  }
  return value
}
