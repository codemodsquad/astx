export const input = `
const foo = { a: 1, b: 2 }
`

export const find = `const x = { /**/ $key: $value }`

export const expectedFind = [
  {
    node: `a: 1`,
    captures: {
      $key: 'a',
      $value: '1',
    },
  },
  {
    node: `b: 2`,
    captures: {
      $key: 'b',
      $value: '2',
    },
  },
]

export const replace = `const x = { /**/ $value: $key }`

export const expectedReplace = `
const foo = { 1: a, 2: b }
`
