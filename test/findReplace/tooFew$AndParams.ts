export const input = `
`

export const find = `
$And(Foo)
`

export const expectedError = `$And must be called with at least 2 arguments`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedError,
})
