export const input = `
[1, 2, 3, 4, 5];
[1, 2, 3, 5];
[1, 2, 4, 5];
[1, 2, 4];
`

export const find = `[$_a, 4, $_b]`

export const expectedFind = [
  {
    node: '[1, 2, 3, 4, 5]',
    arrayCaptures: {
      $_a: ['1', '2', '3'],
      $_b: ['5'],
    },
  },
  {
    node: '[1, 2, 4, 5]',
    arrayCaptures: {
      $_a: ['1', '2'],
      $_b: ['5'],
    },
  },
  {
    node: '[1, 2, 4]',
    arrayCaptures: {
      $_a: ['1', '2'],
      $_b: [],
    },
  },
]
