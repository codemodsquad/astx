export const input = `
class Foo implements A, B, C, D { }
`

export const find = `
class Foo implements $_a, C, $d { }
`

export const expected = [
  {
    node: `class Foo implements A, B, C, D { }`,
    captures: {
      $d: 'D',
    },
    arrayCaptures: {
      $_a: ['A', 'B'],
    },
  },
]
