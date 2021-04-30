export const input = `
foo(a, {b: 3, c: 4}, c, d, [1, 2, 3])
`

export const find = `$1($$a, d, $c)`

export const expectedFind = [
  {
    node: `foo(a, {b: 3, c: 4}, c, d, [1, 2, 3])`,
    captures: {
      $1: 'foo',
      $c: '[1, 2, 3]',
    },
    arrayCaptures: {
      $$a: ['a', '{b: 3, c: 4}', 'c'],
    },
  },
]

export const replace = `$1(d, $$a, e, $c, f)`

export const expectedReplace = `
foo(
  d,
  a,
  {
    b: 3,
    c: 4,
  },
  c,
  e,
  [1, 2, 3],
  f
);
`
