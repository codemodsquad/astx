export const input = `
class Foo implements A, B, C, D { }
`

export const find = `
class Foo implements $_a, C, $d { }
`

export const expectedFind = [
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

export const replace = `
class Bar implements C, $_a, E, $d { }
`

export const expectedReplace = `
class Bar implements C, A, B, E, D { }
`
