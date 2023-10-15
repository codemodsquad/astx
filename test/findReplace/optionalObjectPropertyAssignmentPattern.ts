export const input = `
let foo
let {bar = 2} = foo
let {baz} = foo
`

export const find = `
let /**/ {$a = $Maybe($b)} = $c
`

export const expectedFind = [
  {
    captures: { $a: 'bar', $b: '2', $c: 'foo' },
    node: '{bar = 2} = foo',
  },
  {
    captures: { $a: 'baz', $c: 'foo' },
    node: '{baz} = foo',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
