import { NodePath } from '../../../src/types'

export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const where = {
  $b: (path: NodePath): boolean =>
    typeof path.value.value === 'number' && path.value.value < 4,
}

export const expectedFind = [
  {
    node: '1 + 2',
    captures: { $a: '1', $b: '2' },
  },
]

export const replace = `$b + $a`

export const expectedReplace = `
2 + 1
const foo = bar
3 + 5
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  where,
  expectedFind,
  replace,
  expectedReplace,
})
