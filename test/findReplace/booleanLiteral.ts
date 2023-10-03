export const input = `
foo(true, false)
`

export const find = `
true
`

export const expectedFind = [
  {
    node: 'true',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
