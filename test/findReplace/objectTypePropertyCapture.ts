export const input = `
type X = { a: number, b: string }
c
d()
`

export const find = `
type X = { /**/ $a: $ }
`

export const expectedFind = ['a: number', 'b: string'].map((node) => ({
  node,
  captures: { $a: node },
}))
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
