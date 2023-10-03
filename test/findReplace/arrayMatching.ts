export const input = `
[1, 2, 3, 4, 5]
`

export const find = `[$a, 2, $$b, 5]`

export const expectedFind = [
  {
    node: '[1, 2, 3, 4, 5]',
    captures: { $a: '1' },
    arrayCaptures: {
      $$b: ['3', '4'],
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
