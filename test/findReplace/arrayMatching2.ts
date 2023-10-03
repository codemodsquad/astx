export const input = `
[1, 2, 3, 4, 5];
[1, 2, 3, 5];
[1, 2, 4, 5];
[1, 2, 4];
`

export const find = `[$$a, 4, $$b]`

export const expectedFind = [
  {
    node: '[1, 2, 3, 4, 5]',
    arrayCaptures: {
      $$a: ['1', '2', '3'],
      $$b: ['5'],
    },
  },
  {
    node: '[1, 2, 4, 5]',
    arrayCaptures: {
      $$a: ['1', '2'],
      $$b: ['5'],
    },
  },
  {
    node: '[1, 2, 4]',
    arrayCaptures: {
      $$a: ['1', '2'],
      $$b: [],
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
