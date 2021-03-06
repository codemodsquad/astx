import t from 'ast-types'
import { ASTNode } from 'jscodeshift'
import shallowEqual from 'shallowequal'

/* eslint-disable @typescript-eslint/no-use-before-define */

export default function areASTsEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type === 'File')
    return b.type === 'File' && areFieldValuesEqual(a.program, b.program)
  if (a.type !== b.type) return false
  const nodeFields = t.getFieldNames(a)
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
