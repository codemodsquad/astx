export const input = `
type Foo<W, X, Y, Z> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`

export const find = `type Foo<$a, $_b, Z> = $c`

export const expectedFind = [
  {
    node: 'type Foo<W, X, Y, Z> = [W, X, Y, Z]',
    captures: {
      $a: 'W',
      $c: '[W, X, Y, Z]',
    },
    arrayCaptures: {
      $_b: ['X', 'Y'],
    },
  },
]

export const replace = `type Foo<Z, $_b, $a> = $c`

export const expectedReplace = `
type Foo<Z, X, Y, W> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`
