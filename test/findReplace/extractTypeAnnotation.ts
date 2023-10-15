export const input = `
let a: { foo: number, bar: string, baz: number }
`

export const find = `type x = { /**/ $a: number }`

export const expectedFind = [
  {
    node: `foo: number`,
    captures: {
      $a: 'foo',
    },
  },
  {
    node: `baz: number`,
    captures: {
      $a: 'baz',
    },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
