export const input = `
a.b
c.d
f
g()
`

export const find = `
(/**/$a).b
`

export const expectedFind = ['a', 'c'].map((node) => ({
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
