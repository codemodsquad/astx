export const input = `
function foo(w, x, y, z) {}
function bar(a, b, c) {}
`

export const find = `function foo($a, $$b, z) {}`

export const expectedFind = [
  {
    node: 'function foo(w, x, y, z) {}',
    captures: {
      $a: 'w',
    },
    arrayCaptures: {
      $$b: ['x', 'y'],
    },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
