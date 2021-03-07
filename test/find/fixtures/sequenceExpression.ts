export const input = `
const foo = (w, x, y, z)
const bar = (a, b, c)
`

export const find = `const $c = ($a, $_b, z)`

export const expected = [
  {
    node: 'const foo = (w, x, y, z)',
    captures: {
      $a: 'w',
      $c: 'foo',
    },
    arrayCaptures: {
      $_b: ['x', 'y'],
    },
  },
]
