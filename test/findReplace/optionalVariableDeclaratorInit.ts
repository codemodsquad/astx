export const input = `
let foo
let bar = 2
`

export const find = `
let $a = $Maybe($b)
`

export const expectedFind: ExpectedMatch[] = [
  {
    captures: { $a: 'foo' },
    node: 'let foo',
  },
  {
    captures: { $a: 'bar', $b: '2' },
    node: 'let bar = 2',
  },
]
import { ExpectedMatch, findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
