export const input = `
[1, 2, 3, 4, 5]
`

export const find = `[$a, 2, $_b, 5]`

export const expected = [
  {
    node: '[1, 2, 3, 4, 5]',
    captures: { $a: '1' },
    arrayCaptures: {
      $_b: ['3', '4'],
    },
  },
]
