export const input = `
[1, 2, 3, 4, 5]
`

export const find = `[1, 2, 3, 5, 4]`

export const expectedFind = []
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
