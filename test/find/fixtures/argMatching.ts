export const input = `
foo(1, 3)
foo(2, 3)
`

export const find = `foo(2, $a)`

export const expected = [
  {
    node: 'foo(2, 3)',
    captures: { $a: '3' },
  },
]
