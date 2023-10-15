export const input = `
const foo = bar
`

export const find = `
const /**/ $a = $
`

export const expectedFind = [
  {
    node: 'foo = bar',
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
