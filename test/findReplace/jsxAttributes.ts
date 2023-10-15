export const input = `
const foo = <Foo a b c={2} e={d} />
`

export const find = `<$a $$b c={$c} $$d />`

export const expectedFind = [
  {
    node: `<Foo a b c={2} e={d} />`,
    captures: {
      $a: 'Foo',
      $c: '{2}',
    },
    arrayCaptures: {
      $$b: ['a', 'b'],
      $$d: ['e={d}'],
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
