export const input = `
({ a, b: 2 })
c
d()
({ e: f })
`

export const find = `
({ /**/ $a })
`

export const expectedFind = ['a', 'b: 2', 'e: f'].map((node) => ({
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
