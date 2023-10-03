export const input = `
type A = B & C & D[] & E[] & F
type B = B & C & D[] & E & F
`

export const find = `type $a = $$b & $c[] & F`

export const expectedFind = [
  {
    node: `type A = B & C & D[] & E[] & F`,
    captures: { $a: 'A', $c: 'E' },
    arrayCaptures: { $$b: ['B', 'C', 'D[]'] },
  },
]

export const replace = `type $c = $a[] & F & $$b & Q`

export const expectedReplace = `
type E = A[] & F & B & C & D[] & Q
type B = B & C & D[] & E & F
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
