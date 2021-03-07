export const input = `
const a = {a: 1, ...x, b: 2, c, ...d, e: 5, f}
const b = {a: 1, b: 2, c, ...d, e: 5 }
const h = {a: 1, b: 2, c, e: 5, f}
`

export const find = `{ $_a, c, $b, e: 5, f }`

export const expected = [
  {
    node: '{a: 1, ...x, b: 2, c, ...d, e: 5, f}',
    captures: {
      $b: '...d',
    },
    arrayCaptures: {
      $_a: ['a: 1', '...x', 'b: 2'],
    },
  },
]
