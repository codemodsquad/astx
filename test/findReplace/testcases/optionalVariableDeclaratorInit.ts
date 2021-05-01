export const input = `
let foo
let bar = 2
`

export const find = `
let $a = $Optional($b)
`

export const expectedFind = [
  {
    captures: { $a: 'foo' },
    node: 'let foo',
  },
  {
    captures: { $a: 'bar', $b: '2' },
    node: 'let bar = 2',
  },
]
