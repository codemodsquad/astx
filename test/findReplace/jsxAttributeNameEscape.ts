export const input = `
const x = <A $$b />
`

export const find = `
const x = <A $_$b />
`

export const replace = `
const x = <A $_$c />
`

export const expectedReplace = `
const x = <A $$c />
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
