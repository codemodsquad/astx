export const input = `
const a = {foo: 1}
`

export const find = `
const a = /**/{$p: 1}
`

export const expectedFind = [
  {
    captures: {
      $p: 'foo',
    },
    node: '{foo: 1}',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
