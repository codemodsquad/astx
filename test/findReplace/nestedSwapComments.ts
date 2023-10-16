export const input = `
/*a*/(1 + 2)/*b*/ * /*c*/(3 + 4)/*d*/
`

export const find = `
$a * $b
`

export const replace = `
$b * $a
`

export const expectedReplace = (parser: string): string =>
  parser.startsWith('recast/babel')
    ? `
/*a*/ (3 + 4) * (1 + 2) /*b*/ /*c*/; /*d*/
`
    : `
/*a*/ /*c*/ (3 + 4) * (1 + 2) /*b*/; /*d*/
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
