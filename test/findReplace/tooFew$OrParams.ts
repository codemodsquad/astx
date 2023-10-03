export const input = `
`

export const find = `
$Or(Foo)
`

export const expectedError = `$Or must be called with at least 2 arguments`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedError,
})
