export const input = `
import foo from 'foo'
`

export const find = `
import $x from '$y'
`

export const replace = `
import type $x from '$y'
import $_x from 'y'
`

export const expectedReplace = `
import type foo from 'foo'
import $x from 'y'
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
