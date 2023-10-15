export const input = `
function foo() { }
function bar(): number { }
`

export const find = `
function $fn(): $Maybe<$ret> { }
`

export const expectedFind: ExpectedMatch[] = [
  {
    captures: {
      $fn: 'foo',
    },
    node: 'function foo() { }',
  },
  {
    captures: {
      $fn: 'bar',
      $ret: 'number',
    },
    node: 'function bar(): number { }',
  },
]
import { ExpectedMatch, findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
