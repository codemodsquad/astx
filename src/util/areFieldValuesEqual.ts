import * as AstTypes from 'ast-types'
import shallowEqual from 'shallowequal'

export default function areFieldValuesEqual(
  t: typeof AstTypes,
  a: unknown,
  b: unknown
): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || b.length !== a.length) return false
    return a.every((value, index) => areFieldValuesEqual(t, value, b[index]))
  } else if (t.namedTypes.Node.check(a)) {
    return (
      t.namedTypes.Node.check(b) && t.astNodesAreEquivalent(a as any, b as any)
    )
  } else {
    return shallowEqual(a, b)
  }
}
