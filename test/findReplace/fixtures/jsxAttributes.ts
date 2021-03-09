export const input = `
const foo = <Foo a b c={2} e={d} />
`

export const find = `<$a $_b c={$c} $_d />`

export const expectedFind = [
  {
    node: `<Foo a b c={2} e={d} />`,
    captures: {
      $a: 'Foo',
      $c: '{2}',
    },
    arrayCaptures: {
      $_b: ['a', 'b'],
      $_d: ['e={d}'],
    },
  },
]
