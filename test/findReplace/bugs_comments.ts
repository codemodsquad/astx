export const input = `
// before
const a = 1
const b = 2
// after
`

export const find = `
const $a = $av
const $b = $bv
`

export const replace = `
const $b = $av
const $a = $bv
`

export const expectedReplace = `
// before
const b = 1
const a = 2
// after
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
