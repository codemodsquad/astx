export const input = `
const a = 1 + foo(2, 3, 4)
`

export const find = `
$a + foo(2, $$b)
`

export const replace = `
foo($$b, $$c) + $a + $c
`

export const expectedReplace = `
const a = foo(3, 4, $$c) + 1 + $c
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
