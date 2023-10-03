export const input = `
function foo() { }
function bar(): number { }
`

export const find = `
function $fn(): $ret { }
`

export const expectedFind = [
  {
    captures: {
      $fn: 'bar',
      $ret: 'number',
    },
    node: 'function bar(): number { }',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
