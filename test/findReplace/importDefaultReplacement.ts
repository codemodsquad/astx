export const input = `
import foo from 'foo'
`

export const find = `
import $x from '$x'
`

export const replace = `
import $x from 'y'
`

export const expectedReplace = `
import foo from 'y'
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
