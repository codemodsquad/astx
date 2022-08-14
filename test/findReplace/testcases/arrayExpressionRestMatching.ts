export const input = `
[1, 2, 3, 4, 5]
`

export const find = `[$$$b, 2, 5, $a]`

export const expectedFind = [
  {
    node: '[1, 2, 3, 4, 5]',
    captures: { $a: '1' },
    arrayCaptures: {
      $$$b: ['3', '4'],
    },
  },
]

export const replace = `[2, $$$b, 5]`

export const expectedReplace = `[2, 3, 4, 5]`
