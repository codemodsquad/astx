export const input = `
(1 + 2) * (3 + 4)
`

export const find = `
$a * $b
`

export const replace = `
$b * $a
`

export const expectedReplace = `
(3 + 4) * (1 + 2)
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
