export const input = `
type Foo = A.B.$C
`

export const find = `
type X = /**/ $A.$B.$_C
`

export const expectedFind = [
  {
    node: 'A.B.$C',
    captures: {
      $A: 'A',
      $B: 'B',
    },
  },
]

export const replace = `
type X = /**/ $B.$A.$_C
`

export const expectedReplace = `
type Foo = B.A.$C
`
