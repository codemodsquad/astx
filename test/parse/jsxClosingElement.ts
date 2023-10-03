import { parseTestcase } from '../parseTestcase'

export const input = `
(<X>{a}{/**/} </X>/**/)
`

export const expected = `</X>`

parseTestcase({
  file: __filename,
  input,
  expected,
})
