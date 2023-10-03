export const input = `
const foo = 'bar'
`

export const find = `'bar'`

export const expectedFind = [{ node: `'bar'` }]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
