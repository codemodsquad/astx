export const input = `
const foo = 1
const bar: number = 1
`

export const find = `
const $a: $Maybe<$type> = $init
`

export const expectedFind: ExpectedMatch[] = [
  {
    captures: {
      $a: 'foo',
      $init: '1',
    },
    node: 'const foo = 1',
  },
  {
    captures: {
      $a: 'bar',
      $type: 'number',
      $init: '1',
    },
    node: 'const bar: number = 1',
  },
]
import { ExpectedMatch, findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
