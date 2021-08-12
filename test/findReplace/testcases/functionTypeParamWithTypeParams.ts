export const input = `
type Foo = (bar: A<B>) => void
`

export const find = `
type Foo = (bar: $a<$b>) => void
`

export const expectedFind = [
  {
    node: input.trim(),
    captures: {
      $a: 'A',
      $b: 'B',
    },
  },
]
