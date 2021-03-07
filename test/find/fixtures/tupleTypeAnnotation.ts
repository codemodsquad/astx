export const input = `
type Foo = [W, X, Y, Z]
type Bar = [A, B, C]
`

export const find = `type $c = [$a, $_b, Z]`

export const expected = [
  {
    node: 'type Foo = [W, X, Y, Z]',
    captures: {
      $a: 'W',
      $c: 'Foo',
    },
    arrayCaptures: {
      $_b: ['X', 'Y'],
    },
  },
]
