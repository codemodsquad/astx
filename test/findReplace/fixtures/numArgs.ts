export const input = `
foo(1)
foo(2, 3)
`

export const find = `foo($a)`

export const expectedFind = [
  {
    node: 'foo(1)',
    captures: { $a: '1' },
  },
]
