export const input = `
let foo
let bar = 1
`

export const find = `
let $a = $b
`

export const expectedFind = [
  {
    captures: {
      $a: 'bar',
      $b: '1',
    },
    node: 'let bar = 1',
  },
]
