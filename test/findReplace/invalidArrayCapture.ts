export const input = `
function foo () { }
`

export const find = `
function $$test () { }
`

export const expectedError =
  'array capture placeholder $$test is in an invalid position'
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedError,
})
