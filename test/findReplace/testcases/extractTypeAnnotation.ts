export const input = `
let a: { foo: number, bar: string, baz: number }
`

export const find = `type x = { /**/ $a: number }`

export const expectedFind = [
  {
    node: `let x: { /**/ foo: number }`,
    captures: {
      $a: 'foo',
    },
  },
  {
    node: `let x: { /**/ baz: number }`,
    captures: {
      $a: 'baz',
    },
  },
]
