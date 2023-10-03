export const input = `
`

export const find = `
$Maybe(Foo, Bar)
`

export const expectedError = `$Maybe must be used with 1 type parameter`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedError,
})
