export const input = `
type X<A, B> = { a: number, b: string }
c
d()
`

export const find = `
type X</**/$a> = any
`

export const expectedFind = ['A', 'B'].map((node) => ({
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
