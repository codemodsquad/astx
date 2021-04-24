export const input = `
const foo = (w, x, y, z)
const bar = (a, b, c)
`

export const find = `const $c = ($a, $$b, z)`

export const expectedFind = [
  {
    node: 'const foo = (w, x, y, z)',
    captures: {
      $a: 'w',
      $c: 'foo',
    },
    arrayCaptures: {
      $$b: ['x', 'y'],
    },
  },
]

export const replace = `const $a = (z, 2, $$b, $c, 5)`

export const expectedReplace = `
const w = (z, 2, x, y, foo, 5)
const bar = (a, b, c)
`
