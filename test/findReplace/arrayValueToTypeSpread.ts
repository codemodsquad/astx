export const parsers = ['babel/tsx', 'recast/babel/tsx']

export const input = `
const X = [...Y, Z]
`

export const find = `
const $A = [...$B, $$C]
`

export const replace = `
type $A = [...$B, $$C]
`

export const expectedReplace = `
type X = [...Y, Z]
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  parsers,
  input,
  find,
  replace,
  expectedReplace,
})
