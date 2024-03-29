export const input = `
let foo
let {bar = 2} = foo
let {baz} = foo
`

export const find = `
let /**/ {$a: $b = $Maybe($c)} = $d
`

export const expectedFind: ExpectedMatch[] = [
  {
    captures: { $a: 'bar', $b: 'bar', $c: '2', $d: 'foo' },
    node: '{bar = 2} = foo',
  },
  {
    captures: { $a: 'baz', $b: 'baz', $d: 'foo' },
    node: '{baz} = foo',
  },
]
import { ExpectedMatch, findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
