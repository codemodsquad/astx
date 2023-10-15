export const input = `
[1, 2, 3]
`

export const find = `
[$$$b, $$a]
`

export const expectedError = `can't mix array and rest matchers`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedError,
})
