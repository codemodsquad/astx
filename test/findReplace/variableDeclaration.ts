export const input = `
var a = 1, b, c = 3, d = [1, 2, 3], e
`

export const find = `
var $a, $$b, $c = [1, $$d], e
`

export const expectedFind = [
  {
    node: `var a = 1, b, c = 3, d = [1, 2, 3], e`,
    captures: {
      $a: 'a = 1',
      $c: 'd',
    },
    arrayCaptures: {
      $$b: ['b', 'c = 3'],
      $$d: ['2', '3'],
    },
  },
]

export const replace = `
var $c, $a, e = [$$d, 3, 4], $$b
`

export const expectedReplace = `
var d, a = 1, e = [2, 3, 3, 4], b, c = 3
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
