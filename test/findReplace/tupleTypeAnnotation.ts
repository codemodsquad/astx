export const input = `
type Foo = [W, X, Y, Z]
type Bar = [A, B, C]
`

export const find = `type $c = [$a, $$b, Z]`

export const expectedFind = [
  {
    node: 'type Foo = [W, X, Y, Z]',
    captures: {
      $a: 'W',
      $c: 'Foo',
    },
    arrayCaptures: {
      $$b: ['X', 'Y'],
    },
  },
]

export const replace = `type $a = [$$b, 1, Z, $c]`

export const expectedReplace = `
type W = [X, Y, 1, Z, Foo]
type Bar = [A, B, C]
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
