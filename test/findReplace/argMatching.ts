export const input = `
foo(1, 3)
foo(2, 3)
`

export const find = `foo(2, $a)`

export const expectedFind = [
  {
    node: 'foo(2, 3)',
    captures: { $a: '3' },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
