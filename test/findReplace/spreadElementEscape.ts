export const input = `
const x = {...$b}
`

export const find = '{...$_b}'

export const expectedFind = [
  {
    node: '{...$b}',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
