export const input = `
let a = 1, b
c()
d = x
`

export const find = `
let /**/ $a
`

export const expectedFind = ['a', 'b'].map((node) => ({
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
