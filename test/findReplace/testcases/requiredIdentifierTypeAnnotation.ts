export const input = `
const foo = 1
const bar: number = 1
`

export const find = `
const $a: $type = $init
`

export const expectedFind = [
  {
    captures: {
      $a: 'bar: number',
      $type: 'number',
      $init: '1',
    },
    node: 'const bar: number = 1',
  },
]
