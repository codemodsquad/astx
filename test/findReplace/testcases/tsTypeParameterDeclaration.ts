export const parsers = ['tsx', 'tsx-babel-generator']

export const input = `
type Foo<W, X, Y, Z extends {foo: 1}> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`

export const find = `type Foo<$a, $$b, Z extends {foo: $foo}> = $c`

export const expectedFind = [
  {
    node: 'type Foo<W, X, Y, Z extends {foo: 1}> = [W, X, Y, Z]',
    captures: {
      $a: 'W',
      $c: '[W, X, Y, Z]',
      $foo: '1',
    },
    arrayCaptures: {
      $$b: ['X', 'Y'],
    },
  },
]

export const replace = `type Foo<Z extends {bar: $foo}, $$b, $a> = $c`

export const expectedReplace = `
type Foo<Z extends {bar: 1}, X, Y, W> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`
