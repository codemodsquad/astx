export const input = `
const x = {
  a, b
}
`

export const find = `
const x = { /**/ a: $a }
`

export const expectedFind = [
  {
    node: 'a',
    captures: { $a: 'a' },
  },
]

export const replace = `
const x = { /**/ c: $a }
`

export const expectedReplace = `
const x = {
  c: a, b
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
