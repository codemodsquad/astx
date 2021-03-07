export const input = `
type Foo = Bar<W, X, Y, Z>
type Baz = Qux<A, B, C>
`

export const find = `type $1 = $2<$a, $_b, Z>`

export const expected = [
  {
    node: 'type Foo = Bar<W, X, Y, Z>',
    captures: {
      $1: 'Foo',
      $2: 'Bar',
      $a: 'W',
    },
    arrayCaptures: {
      $_b: ['X', 'Y'],
    },
  },
]
