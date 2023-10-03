export const input = `
foo(1, 1, {foo: 1}, {foo: 1})
foo(1, 2, {foo: 1}, {foo: 1})
foo(1, 1, {foo: 1}, {bar: 1})
`

export const find = `foo($a, $a, $b, $b)`

export const expectedFind = [
  {
    node: 'foo(1, 1, {foo: 1}, {foo: 1})',
    captures: { $a: '1', $b: '{foo: 1}' },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
