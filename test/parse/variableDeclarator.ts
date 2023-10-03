import { parseTestcase } from '../parseTestcase'

export const input = `
let /**/x = 1/**/
`

export const expected = `x = 1`

parseTestcase({
  file: __filename,
  input,
  expected,
})
