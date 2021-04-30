export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const expectedFind = [
  {
    node: '1 + 2',
    captures: { $a: '1', $b: '2' },
  },
  {
    node: '3 + 5',
    captures: { $a: '3', $b: '5' },
  },
]
