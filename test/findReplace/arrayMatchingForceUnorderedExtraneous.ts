export const input = `
[1, 2, 3, 4, 5]
`

export const find = `[$Unordered, 1, 2, 3, 5, 4, 6]`

export const expectedFind = []
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
