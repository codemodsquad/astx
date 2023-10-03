import { parseTestcase } from '../parseTestcase'

export const input = `
let /**/x: number/**/ = 1
`

export const expected = `x: number`

parseTestcase({
  file: __filename,
  input,
  expected,
})
