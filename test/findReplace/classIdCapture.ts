export const input = `
class a extends b implements x, y {}
let c = class d extends e {}
a.b
c.d
f
g()
`

export const find = `
class /**/$a {}
`

export const expectedFind = ['a', 'd'].map((node) => ({
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
