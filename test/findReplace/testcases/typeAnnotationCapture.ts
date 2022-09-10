export const input = `
export type F = (strings: string[]) => Node | Node[]
`

export const find = `
type X = /**/ $T
`

export const expectedFind = [
  {
    captures: {
      $T: '(strings: string[]) => Node | Node[]',
    },
    node: '(strings: string[]) => Node | Node[]',
  },
  {
    captures: {
      $T: 'string[]',
    },
    node: 'string[]',
  },
  {
    captures: {
      $T: 'string',
    },
    node: 'string',
  },
  {
    captures: {
      $T: 'Node | Node[]',
    },
    node: 'Node | Node[]',
  },
  {
    captures: {
      $T: 'Node',
    },
    node: 'Node',
  },
  {
    captures: {
      $T: 'Node[]',
    },
    node: 'Node[]',
  },
  {
    captures: {
      $T: 'Node',
    },
    node: 'Node',
  },
]
