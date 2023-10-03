export const input = `
a()
b()
let c, d
e.f
`

export const find = `
(/**/$a)()
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
