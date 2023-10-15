export const input = `
function foo() {
  $a
}
`

export const find = `
function foo() {
  $_a
}
`

export const expectedFind = [{ node: input.trim() }]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
