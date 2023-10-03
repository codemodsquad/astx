export const input = `
const x = 1
`

export const find = `
const x = /foo/
`

export const expectedFind = []
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
