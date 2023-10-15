export const input = `
const foo = [baz, qux, qlorm]
`

export const find = `
const /**/ $a = [qux, $$$]
`

export const expectedFind = [
  {
    node: 'foo = [baz, qux, qlorm]',
    captures: { $a: 'foo' },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
