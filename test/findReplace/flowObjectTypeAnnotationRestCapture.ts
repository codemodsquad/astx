export const input = `
type X = {| ...C, a?: number, b: string |}
`

export const find = `
type X = /**/ {| $$$a: $ |}
`

export const replace = `
type X = /**/ { $$$a: $ }
`

export const expectedReplace = `
type X = {
  ...C,
  a?: number,
  b: string
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  parsers: ['babel', 'recast/babel'],
  input,
  find,
  replace,
  expectedReplace,
})
