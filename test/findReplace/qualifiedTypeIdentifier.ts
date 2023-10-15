export const input = `
type Foo = A.B.$C
`

export const find = `
type X = /**/ $A.$B.$_C
`

export const expectedFind = [
  {
    node: 'A.B.$C',
    captures: {
      $A: 'A',
      $B: 'B',
    },
  },
]

export const replace = `
type X = /**/ $B.$A.$_C
`

export const expectedReplace = `
type Foo = B.A.$C
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
