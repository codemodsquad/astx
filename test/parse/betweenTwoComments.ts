import { parseTestcase } from '../parseTestcase'

export const input = `
(<X>{/**/}{a}{/**/}</X>)
`

export const expected = `{a}`

parseTestcase({
  file: __filename,
  input,
  expected,
})
