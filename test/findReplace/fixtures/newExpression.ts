export const input = `
new foo(a, {b: 3, c: 4}, c, d, [1, 2, 3])
`

export const find = `new $1($_a, d, $c)`

export const expectedFind = [
  {
    node: `new foo(a, {b: 3, c: 4}, c, d, [1, 2, 3])`,
    captures: {
      $1: 'foo',
      $c: '[1, 2, 3]',
    },
    arrayCaptures: {
      $_a: ['a', '{b: 3, c: 4}', 'c'],
    },
  },
]

export const replace = `new $1(d, $_a, e, $c, f)`

export const expectedReplace = `
new foo(d, a, { b: 3, c: 4 }, c, e, [1, 2, 3], f)
`
