export const input = `
const foo = bar
`

export const find = `
const /**/ $a = $
`

export const expectedFind = [
  {
    node: 'foo = bar',
    captures: { $a: 'foo' },
  },
]
