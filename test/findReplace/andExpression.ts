export const input = `
const a = 1
const b = 2
const c = {foo: 3}
`

export const find = `
$And($obj, {foo: $value})
`

export const expectedFind = [
  {
    captures: {
      $obj: '{foo: 3}',
      $value: '3',
    },
    node: '{foo: 3}',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
